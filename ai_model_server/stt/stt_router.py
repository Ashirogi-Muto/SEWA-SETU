"""
STT Router — Strategy pattern for selecting STT provider.

Supports:
  - "sarvam"  : Sarvam AI cloud API (default, lightweight)
  - "legacy"  : Local Whisper + IndicConformer (heavy, ~2-3 GB RAM)

Confidence-gated fallback:
  If Sarvam returns low language_probability (< threshold),
  automatically retries with the legacy provider.

Legacy models are lazy-imported to avoid loading ~2-3 GB into RAM
when only using the Sarvam provider.
"""
import os
from enum import Enum

# Minimum language_probability from Sarvam to accept without fallback
CONFIDENCE_THRESHOLD = float(os.getenv("SARVAM_CONFIDENCE_THRESHOLD", "0.7"))


class STTProvider(str, Enum):
    SARVAM = "sarvam"
    LEGACY = "legacy"


def get_stt_mode() -> str:
    """
    Service mode detection.
    Inspired by temp/apps/api/routes/ai.routes.ts getAIServiceMode().
    """
    has_sarvam = bool(os.getenv("SARVAM_API_KEY"))
    has_hf = bool(os.getenv("HUGGING_FACE_HUB_TOKEN"))

    if has_sarvam and has_hf:
        return "PRODUCTION"
    if has_sarvam or has_hf:
        return "HYBRID_FALLBACK"
    return "DEMO"


def _run_legacy(audio_bytes: bytes) -> dict | None:
    """Lazy-import and run the legacy Whisper+IndicConformer pipeline."""
    from ai_model_server.stt.stt import transcribe_audio_blob
    return transcribe_audio_blob(audio_bytes)


async def transcribe(audio_bytes: bytes, provider: str = None) -> dict:
    """
    Route transcription to the selected provider.

    Args:
        audio_bytes: Raw audio file bytes (WebM, WAV, etc.)
        provider: "sarvam" or "legacy". If None, uses STT_PROVIDER env var.

    Returns:
        dict with keys: text, language, model (+ language_confidence for Sarvam)
    """
    provider = provider or os.getenv("STT_PROVIDER", "sarvam")
    fallback_enabled = os.getenv("SARVAM_FALLBACK_TO_LEGACY", "true").lower() == "true"

    # ── Force legacy if no Sarvam API key ──
    if provider == STTProvider.SARVAM and not os.getenv("SARVAM_API_KEY"):
        print("⚠️ STT Router: No SARVAM_API_KEY, falling back to legacy provider")
        provider = STTProvider.LEGACY

    # ── Sarvam path ──
    if provider == STTProvider.SARVAM:
        from ai_model_server.stt.sarvam_stt import transcribe_sarvam

        result = await transcribe_sarvam(audio_bytes)

        if result:
            confidence = result.get("language_confidence") or 1.0

            # Confidence gate: accept if above threshold
            if confidence >= CONFIDENCE_THRESHOLD:
                return result

            # Low confidence — try legacy fallback
            print(f"⚠️ STT Router: Sarvam confidence {confidence:.2f} < {CONFIDENCE_THRESHOLD}, "
                  f"fallback={'enabled' if fallback_enabled else 'disabled'}")

            if fallback_enabled:
                legacy_result = _run_legacy(audio_bytes)
                if legacy_result:
                    return legacy_result

            # Return Sarvam result anyway (better than nothing)
            return result

        # Sarvam returned None (error)
        if fallback_enabled:
            print("⚠️ STT Router: Sarvam failed, falling back to legacy")
            legacy_result = _run_legacy(audio_bytes)
            if legacy_result:
                return legacy_result

        return {"text": "", "model": "none", "error": "Sarvam failed, no fallback"}

    # ── Legacy path (explicit or forced) ──
    print("🔧 STT Router: Using legacy provider (Whisper + IndicConformer)")
    result = _run_legacy(audio_bytes)
    if result:
        return result

    return {"text": "", "model": "none", "error": "Legacy transcription failed"}
