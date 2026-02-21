import io
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List
from ai_model_server.stt.stt import transcribe_audio_blob

# --- TensorFlow and Image Processing Imports ---
import numpy as np
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions

# --- 1. Load Model ---
model = MobileNetV2(weights='imagenet')

# --- 2. Business Logic ---
def map_prediction_to_category(raw_prediction_label: str) -> str:
    label = raw_prediction_label.lower()
    if any(keyword in label for keyword in ['truck', 'car', 'bus', 'ambulance', 'motorcycle', 'convertible', 'wreck']):
        return "Traffic Obstruction"
    if any(keyword in label for keyword in ['trash_can', 'garbage', 'waste', 'bin', 'dumpster']):
        return "Waste Management"
    if any(keyword in label for keyword in ['street_lamp', 'spotlight', 'street_sign']):
        return "Streetlight Outage"
    if any(keyword in label for keyword in ['pothole', 'manhole_cover']):
        return "Pothole"
    return "General Inquiry"

# --- 3. Schemas ---
class AIRequest(BaseModel):
    description: str
    # UPDATED: The list can now be empty, removing the strict validation.
    image_urls: List[str] = []

class AIResponse(BaseModel):
    category: str
    confidence: float

# --- 4. Image Processing ---
def classify_image_from_url(url: str):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        image = image.resize((224, 224))
        image_array = np.array(image)
        image_array = np.expand_dims(image_array, axis=0)
        processed_image = preprocess_input(image_array)
        
        predictions = model.predict(processed_image)
        decoded_predictions = decode_predictions(predictions, top=1)[0]
        
        top_prediction = decoded_predictions[0]
        _, raw_label, confidence = top_prediction
        final_category = map_prediction_to_category(raw_label)
        
        return {"category": final_category, "confidence": float(confidence)}
    except Exception as e:
        print(f"ERROR: Could not process image from URL {url}. Reason: {e}")
        return None

# --- 5. FastAPI App ---
app = FastAPI(title="Real AI Classification Server")

@app.post("/api/classify", response_model=AIResponse)
async def classify_issue(request: AIRequest):
    # If no images are provided, we can't classify.
    # A more advanced model could use the description, but ours can't.
    if not request.image_urls:
        return AIResponse(category="General Inquiry", confidence=0.0)

    image_url = request.image_urls[0]
    result = classify_image_from_url(image_url)
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to process the image.")
        
    return result

@app.post("/api/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/") and file.content_type not in ["video/webm", "application/octet-stream"]:
        # Browsers sometimes send webm audio as video/webm or application/octet-stream
        pass 
        
    try:
        audio_bytes = await file.read()
        result = transcribe_audio_blob(audio_bytes)  # Auto-detect language via LID
        if result is None:
            raise HTTPException(status_code=500, detail="Failed to transcribe audio.")
        return result
    except Exception as e:
        print(f"Transcription Route Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))