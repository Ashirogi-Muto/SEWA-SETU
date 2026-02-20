import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import torchaudio
import io
import os
import numpy as np
from pydub import AudioSegment

MODEL_ID = "openai/whisper-small"

print(f"Loading processor for {MODEL_ID}...")
processor = WhisperProcessor.from_pretrained(MODEL_ID)

print(f"Loading model for {MODEL_ID}...")
# Use FP16 if GPU available, else FP32 on CPU
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else "auto"

model = WhisperForConditionalGeneration.from_pretrained(MODEL_ID, torch_dtype=torch_dtype)
model.to(device)
model.eval()

def transcribe_audio_blob(audio_bytes: bytes, lang_code: str = "hi"):
    """
    Transcribes WebM audio bytes using OpenAI Whisper.
    """
    try:
        # Convert webm to 16kHz mono robustly using pydub
        audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
        audio = audio.set_frame_rate(16000).set_channels(1)
        
        # Extract samples as numpy array and normalize based on sample width
        samples = np.array(audio.get_array_of_samples())
        normalization_factor = float(1 << (8 * audio.sample_width - 1))
        speech_array = samples.astype(np.float32) / normalization_factor
        
        # Process input
        inputs = processor(speech_array, sampling_rate=16000, return_tensors="pt").input_features
        inputs = inputs.to(device)
        
        # Whisper specific language token forcing if needed
        # hi for hindi, en for english. Defaulting to auto-detect if not strict.
        forced_decoder_ids = processor.get_decoder_prompt_ids(language=lang_code, task="transcribe")
        
        # Inference
        with torch.no_grad():
            predicted_ids = model.generate(inputs, forced_decoder_ids=forced_decoder_ids)
            
        # Decode
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        return {"text": transcription.strip(), "language": lang_code}
        
    except Exception as e:
        print(f"Transcription error: {e}")
        return None

if __name__ == "__main__":
    print("STT setup complete!")
