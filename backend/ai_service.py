import httpx

from backend.logging_config import get_logger
logger = get_logger("ai_service", "ai_service")
from typing import List, Dict, Any

import os

# Configuration
LOCAL_AI_URL = os.getenv("AI_SERVER_URL", "http://127.0.0.1:8003/api/classify")
AI_TIMEOUT = float(os.getenv("AI_TIMEOUT", "3.0"))

# Note: YOLO model returns mapped categories directly via ai_model_server.
# No ImageNet mapping needed.

async def classify_report_local(description: str, image_urls: List[str]) -> Dict[str, Any]:
    """
    Hybrid classification:
    1. Try Local AI Model Server (if images present)
    2. Fallback to Keyword Analysis (if AI fails or no images)
    """

    ai_result = None

    # 1. Image Classification (if images exist)
    if image_urls:
        try:
            async with httpx.AsyncClient() as client:
                ai_target_url = image_urls[0]

                # Prevent network loopback timeout: rewrite public IP to 127.0.0.1
                if "http://" in ai_target_url and "127.0.0.1" not in ai_target_url and "localhost" not in ai_target_url:
                    import urllib.parse
                    parsed = urllib.parse.urlparse(ai_target_url)
                    port = os.getenv("BACKEND_PORT", "8002")
                    ai_target_url = f"http://127.0.0.1:{port}{parsed.path}"

                # We only send the first image for classification to save time
                response = await client.post(
                    LOCAL_AI_URL,
                    json={"description": description, "image_urls": [ai_target_url]},
                    timeout=AI_TIMEOUT
                )

                if response.status_code == 200:
                    data = response.json()
                    raw_category = data.get("category", "Others")
                    confidence = data.get("confidence", 0.0)

                    valid_categories = ["Roads/Potholes", "Sanitation/Garbage", "Street Lighting", "Public Transport", "Law & Order", "Medical Emergency", "Water Supply", "Electrical Safety"]

                    if raw_category in valid_categories:
                        mapped_category = raw_category
                    else:
                        mapped_category = "Others"

                    if mapped_category != "Others":
                        ai_result = {
                            "category": mapped_category,
                            "confidence": confidence * 100,
                            "severity": "Medium", # Default, refined by keywords
                            "source": "YOLOv8"
                        }
                        logger.info(f" AI Classification success: {mapped_category} ({confidence:.2f})")

        except httpx.TimeoutException:
            logger.warning(f" AI Server timed out after {AI_TIMEOUT}s")
        except Exception as e:
            logger.error(f" AI Server error: {e}")

    # 2. Text Analysis (Keyword Fallback or Refinement)
    text_result = classify_report_simulated_enhanced(description)

    # Merge Logic
    if ai_result:
        # Trust AI category if high confidence, but use text for severity/impact
        final_result = ai_result
        final_result['severity'] = text_result['severity']
        final_result['impact'] = text_result['impact']
        final_result['estimated_repair_time'] = text_result['estimated_repair_time']

        # If AI was unsure (Others), prefer Text result
        if final_result['category'] == "Others" and text_result['category'] != "Others":
             final_result['category'] = text_result['category']
    else:
        final_result = text_result
        final_result['source'] = "KeywordAnalysis"

    return final_result


def classify_report_simulated_enhanced(description: str) -> Dict[str, Any]:
    """
    Robust keyword-based classification for "Hinglish" and English.
    """
    desc_lower = description.lower()

    # Street Lighting
    if any(k in desc_lower for k in ["light", "lamp", "bulb", "dark", "andhera", "batti", "pole", "khamba"]):
        return {
            "category": "Street Lighting",
            "severity": "High",
            "impact": "Reduced visibility at night increases safety concerns.",
            "estimated_repair_time": "2-3 days"
        }

    # Roads/Potholes
    if any(k in desc_lower for k in ["pothole", "hole", "crack", "road", "gaddha", "sadak", "rasta", "tuta"]):
        return {
            "category": "Roads/Potholes",
            "severity": "High",
            "impact": "Can cause vehicle damage and poses safety risks.",
            "estimated_repair_time": "24-48 hours"
        }

    # Sanitation
    if any(k in desc_lower for k in ["garbage", "trash", "waste", "kuda", "kachra", "smell", "gandagi", "safai"]):
        return {
            "category": "Sanitation/Garbage",
            "severity": "Medium",
            "impact": "Attracts pests and creates unhygienic conditions.",
            "estimated_repair_time": "1-2 days"
        }

    # Water Supply
    if any(k in desc_lower for k in ["water", "leak", "pipe", "pani", "nalka", "flood", "bahut"]):
        return {
            "category": "Water Supply",
            "severity": "High",
            "impact": "Water wastage and potential property damage.",
            "estimated_repair_time": "3-5 days"
        }

    # Electrical
    if any(k in desc_lower for k in ["wire", "shock", "current", "bijli", "spark", "cable"]):
        return {
            "category": "Electrical Safety",
            "severity": "Critical",
            "impact": "Severe safety hazard with risk of electrocution.",
            "estimated_repair_time": "Immediate"
        }

    return {
        "category": "Others",
        "severity": "Low",
        "impact": "Requires manual assessment.",
        "estimated_repair_time": "7 days"
    }
