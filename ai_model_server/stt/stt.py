import torch
import io
import os
import numpy as np
from pydub import AudioSegment
from transformers import AutoModel, WhisperProcessor, WhisperForConditionalGeneration
from ai_model_server.logging_config import get_logger
logger = get_logger("stt_legacy", "stt")

# ============================================================
# Configuration
# ============================================================
HF_TOKEN = os.getenv("HUGGING_FACE_HUB_TOKEN", None)

# IndicConformer supported languages
INDIC_LANGUAGES = {
    "as", "bn", "brx", "doi", "gu", "hi", "kn", "kok",
    "ks", "mai", "ml", "mni", "mr", "ne", "or", "pa",
    "sa", "sat", "sd", "ta", "te", "ur"
}

# ============================================================
# 1. Load IndicConformer (for Indian languages)
# ============================================================
INDIC_MODEL_ID = "ai4bharat/indic-conformer-600m-multilingual"
logger.info(f"Loading IndicConformer: {INDIC_MODEL_ID}...")
indic_model = AutoModel.from_pretrained(
    INDIC_MODEL_ID,
    trust_remote_code=True,
    token=HF_TOKEN
)
indic_model.eval()
logger.info("IndicConformer loaded!")

# ============================================================
# 2. Load Whisper Small (For LID and English)
# ============================================================
WHISPER_MODEL_ID = "openai/whisper-small"
whisper_processor = None
whisper_model = None

def _load_whisper():
    """Lazy-load Whisper on first request to save startup memory."""
    global whisper_processor, whisper_model
    if whisper_model is not None:
        return
    logger.info(f"Loading Whisper: {WHISPER_MODEL_ID}...")
    whisper_processor = WhisperProcessor.from_pretrained(WHISPER_MODEL_ID)
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    whisper_model = WhisperForConditionalGeneration.from_pretrained(
        WHISPER_MODEL_ID, torch_dtype=dtype
    )
    whisper_model.to(device)
    whisper_model.eval()
    logger.info("Whisper loaded!")

# ============================================================
# Audio Preprocessing
# ============================================================
def _preprocess_audio(audio_bytes: bytes):
    """Convert raw audio bytes to 16kHz mono float32 numpy array."""
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
    audio = audio.set_frame_rate(16000).set_channels(1)
    samples = np.array(audio.get_array_of_samples())
    normalization_factor = float(1 << (8 * audio.sample_width - 1))
    speech_array = samples.astype(np.float32) / normalization_factor
    return speech_array

# ============================================================
# Language Detection (Using Whisper)
# ============================================================
def detect_language_whisper(speech_array: np.ndarray, inputs) -> str:
    """Detect language using Whisper's initial token prediction."""
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    
    # Send the start of transcript token
    decoder_input_ids = torch.tensor([[whisper_processor.tokenizer.convert_tokens_to_ids("<|startoftranscript|>")]])
    decoder_input_ids = decoder_input_ids.to(device)
    
    with torch.no_grad():
        outputs = whisper_model(inputs, decoder_input_ids=decoder_input_ids)
    
    # Get the language token predicted
    predicted_id = torch.argmax(outputs.logits[:, -1, :], dim=-1).item()
    language_token = whisper_processor.tokenizer.convert_ids_to_tokens(predicted_id)
    
    # Strip '<|' and '|>' from the token
    lang_code = language_token.replace('<|', '').replace('|>', '')
    
    logger.info(f"Whisper LID: detected '{lang_code}'")
    return lang_code

# ============================================================
# Transcription Core
# ============================================================
def transcribe_audio_blob(audio_bytes: bytes, lang_code: str = None):
    try:
        # Preprocess
        speech_array = _preprocess_audio(audio_bytes)
        _load_whisper()
        
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        inputs = whisper_processor(
            speech_array, sampling_rate=16000, return_tensors="pt"
        ).input_features.to(device)
        
        # 1. Detect language if not explicitly provided
        if lang_code is None:
            lang_code = detect_language_whisper(speech_array, inputs)
        else:
            logger.info(f"Language forced: '{lang_code}'")
            
        # 2. Route Transcription
        if lang_code in INDIC_LANGUAGES:
            # Route to IndicConformer
            logger.info(f"Routing to IndicConformer for language: {lang_code}")
            wav_tensor = torch.FloatTensor(speech_array).unsqueeze(0)
            with torch.no_grad():
                transcription = indic_model(wav_tensor, lang_code, "ctc")
            text = transcription if isinstance(transcription, str) else str(transcription)
            return {"text": text.strip(), "language": lang_code, "model": "indic-conformer"}
            
        else:
            # Route to Whisper
            logger.info(f"Routing to Whisper for language: {lang_code}")
            try:
                with torch.no_grad():
                    forced_decoder_ids = whisper_processor.get_decoder_prompt_ids(
                        language=lang_code, task="transcribe"
                    )
                    predicted_ids = whisper_model.generate(
                        inputs, forced_decoder_ids=forced_decoder_ids
                    )
                
                transcription = whisper_processor.batch_decode(
                    predicted_ids, skip_special_tokens=True
                )[0]
                
                return {"text": transcription.strip(), "language": lang_code, "model": "whisper"}
            except ValueError:
                # If Whisper doesn't support the language or it's an invalid token, fallback
                logger.warning(f"Unknown or unsupported language '{lang_code}'. Defaulting to IndicConformer ('hi').")
                fallback_lang = "hi"
                wav_tensor = torch.FloatTensor(speech_array).unsqueeze(0)
                with torch.no_grad():
                    transcription = indic_model(wav_tensor, fallback_lang, "ctc")
                text = transcription if isinstance(transcription, str) else str(transcription)
                return {"text": text.strip(), "language": fallback_lang, "model": "indic-conformer (fallback)"}

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    logger.info("Dual-Model (Whisper LID) STT setup complete!")
