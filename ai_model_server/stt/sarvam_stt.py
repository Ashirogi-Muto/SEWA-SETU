"""
Sarvam AI Speech-to-Text Client
Calls the Sarvam REST API (saaras:v3 model) for transcription.
Auto-detects language from 23 Indian languages + English.
"""
import os
import httpx

SARVAM_API_URL = "https://api.sarvam.ai/speech-to-text"
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")


async def transcribe_sarvam(audio_bytes: bytes, filename: str = "audio.webm") -> dict | None:
    """
    Call Sarvam STT REST API.

    Returns:
        {text, language, language_confidence, model} on success,
        None on failure.
    """
    if not SARVAM_API_KEY:
        print("⚠️ Sarvam STT: No API key configured (SARVAM_API_KEY)")
        return None

    headers = {
        "api-subscription-key": SARVAM_API_KEY,
    }

    # Multipart form data — Sarvam expects 'file' field
    files = {
        "file": (filename, audio_bytes),
    }
    data = {
        "model": "saaras:v3",
        "language_code": "unknown",   # auto-detect
        "mode": "codemix",          # English in English, Hindi in Devanagari
    }

    try:
        print(f"🎤 Sarvam STT: Sending {len(audio_bytes)} bytes to API...")

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                SARVAM_API_URL,
                headers=headers,
                files=files,
                data=data,
            )
            response.raise_for_status()
            result = response.json()

        transcript = result.get("transcript", "")
        language_code = result.get("language_code", "unknown")
        language_prob = result.get("language_probability")

        print(f"✅ Sarvam STT: '{transcript[:60]}...' "
              f"(lang={language_code}, confidence={language_prob})")

        return {
            "text": transcript,
            "language": language_code,
            "language_confidence": language_prob,
            "model": "sarvam-saaras-v3",
        }

    except httpx.HTTPStatusError as e:
        print(f"❌ Sarvam STT HTTP error: {e.response.status_code} - {e.response.text[:200]}")
        return None
    except httpx.TimeoutException:
        print("❌ Sarvam STT: Request timed out (30s)")
        return None
    except Exception as e:
        print(f"❌ Sarvam STT error: {e}")
        return None
