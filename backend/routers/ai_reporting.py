"""
AI Reporting Router for SewaSetu

This module provides advanced AI-powered endpoints for civic report submission
using AWS services (Transcribe and Bedrock) to support multilingual text and voice reports.
"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from pydantic import BaseModel
from backend.services.bedrock_service import get_bedrock_agent
from backend.services.transcribe_service import get_transcribe_service


# Initialize router
router = APIRouter(
    prefix="/ai",
    tags=["AI Reporting"],
    responses={
        404: {"description": "Not found"},
        500: {"description": "Internal server error"}
    }
)


# Response models
class AnalyzeReportResponse(BaseModel):
    """Response model for the analyze report endpoint."""
    translated_text: str
    category: str
    priority: str
    sentiment: str
    source: str  # 'text' or 'audio'
    error: Optional[str] = None


# Initialize services (lazy loading will happen on first use)
bedrock_agent = None
transcribe_service = None


def get_bedrock():
    """Lazy load the Bedrock agent."""
    global bedrock_agent
    if bedrock_agent is None:
        bedrock_agent = get_bedrock_agent()
    return bedrock_agent


def get_transcribe():
    """Lazy load the Transcribe service."""
    global transcribe_service
    if transcribe_service is None:
        transcribe_service = get_transcribe_service()
    return transcribe_service


@router.post("/analyze-report", response_model=AnalyzeReportResponse)
async def analyze_report(
    text: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    language_code: str = Form('hi-IN')
):
    """
    Analyze a civic report using AI (supports both text and voice input).
    
    This endpoint:
    1. Accepts either text or audio file input
    2. Transcribes audio to text if audio is provided (using AWS Transcribe)
    3. Analyzes the text using AI (using AWS Bedrock with Claude)
    4. Returns categorization, priority, sentiment, and translated text
    
    Args:
        text (str, optional): Direct text input of the civic report
        audio_file (UploadFile, optional): Audio file containing voice report
        language_code (str): Language code for transcription. 
                            Options: 'hi-IN' (Hindi), 'en-IN' (English).
                            Default: 'hi-IN'
    
    Returns:
        AnalyzeReportResponse: Analysis results including:
            - translated_text: Professional English translation
            - category: Civic category (Roads, Sanitation, etc.)
            - priority: Priority level (High, Medium, Low)
            - sentiment: Sentiment analysis (Urgent, Frustrated, Neutral)
            - source: Input source ('text' or 'audio')
    
    Raises:
        HTTPException: 400 if neither text nor audio is provided
        HTTPException: 500 if transcription or analysis fails
    
    Example (Text):
        curl -X POST "http://localhost:8000/api/v1/ai/analyze-report" \\
             -F "text=सड़क पर गड्ढा है"
    
    Example (Audio):
        curl -X POST "http://localhost:8000/api/v1/ai/analyze-report" \\
             -F "audio_file=@report.mp3" \\
             -F "language_code=hi-IN"
    """
    try:
        # Validation: Ensure at least one input is provided
        if not text and not audio_file:
            raise HTTPException(
                status_code=400,
                detail="Either 'text' or 'audio_file' must be provided."
            )
        
        # Validation: Ensure only one input is provided
        if text and audio_file:
            raise HTTPException(
                status_code=400,
                detail="Please provide either 'text' or 'audio_file', not both."
            )
        
        final_text = None
        source = None
        
        # STEP 1: Handle Audio Input
        if audio_file:
            print(f"🎤 Processing audio file: {audio_file.filename}")
            source = 'audio'
            
            try:
                # Get the transcribe service
                transcribe_svc = get_transcribe()
                
                # Read the file content
                file_content = await audio_file.read()
                
                # Create a BytesIO object for the transcribe service
                from io import BytesIO
                file_obj = BytesIO(file_content)
                
                # Transcribe the audio to text
                print(f"🔄 Transcribing audio using AWS Transcribe...")
                final_text = transcribe_svc.transcribe_audio(
                    file_obj=file_obj,
                    filename=audio_file.filename,
                    language_code=language_code
                )
                print(f"✅ Transcription complete: '{final_text[:100]}...'")
                
            except RuntimeError as e:
                error_msg = str(e)
                print(f"❌ Transcription error: {error_msg}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Transcription failed: {error_msg}"
                )
            except Exception as e:
                print(f"❌ Unexpected transcription error: {e}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to process audio file: {str(e)}"
                )
        
        # STEP 2: Handle Text Input
        else:
            print(f"📝 Processing text input: '{text[:100]}...'")
            source = 'text'
            final_text = text
        
        # STEP 3: Analyze the text using Bedrock
        print(f"🤖 Analyzing report using AWS Bedrock...")
        try:
            bedrock = get_bedrock()
            analysis_result = bedrock.analyze_report(final_text)
            
            # Add source information
            analysis_result['source'] = source
            
            print(f"✅ Analysis complete!")
            print(f"   Category: {analysis_result.get('category')}")
            print(f"   Priority: {analysis_result.get('priority')}")
            print(f"   Sentiment: {analysis_result.get('sentiment')}")
            
            return analysis_result
            
        except Exception as e:
            print(f"❌ Bedrock analysis error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"AI analysis failed: {str(e)}"
            )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"❌ Unexpected error in analyze_report: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """
    Health check endpoint for the AI service.
    
    Returns:
        dict: Service status and available features
    """
    return {
        "status": "healthy",
        "service": "AI Reporting",
        "features": {
            "text_analysis": True,
            "voice_transcription": True,
            "multilingual_support": True,
            "supported_languages": ["hi-IN (Hindi)", "en-IN (English)"]
        },
        "aws_services": {
            "transcribe": "Amazon Transcribe",
            "bedrock": "Amazon Bedrock (Claude 3.5 Sonnet)"
        }
    }


@router.get("/categories")
async def get_categories():
    """
    Get the list of available report categories.
    
    Returns:
        dict: Available categories and their descriptions
    """
    return {
        "categories": [
            {
                "name": "Roads",
                "description": "Road-related issues like potholes, cracks, damage",
                "examples": ["Pothole", "Road damage", "Broken pavement"]
            },
            {
                "name": "Sanitation",
                "description": "Waste management and cleanliness issues",
                "examples": ["Garbage accumulation", "Overflowing bins", "Littering"]
            },
            {
                "name": "Water Supply",
                "description": "Water-related infrastructure issues",
                "examples": ["Leaking pipes", "Water shortage", "Broken valves"]
            },
            {
                "name": "Electricity",
                "description": "Electrical infrastructure issues",
                "examples": ["Streetlight outage", "Open wires", "Power failure"]
            },
            {
                "name": "Law & Order",
                "description": "Public safety and security concerns",
                "examples": ["Public disturbance", "Safety hazards", "Illegal activities"]
            },
            {
                "name": "Others",
                "description": "General inquiries or uncategorized issues",
                "examples": ["General questions", "Miscellaneous concerns"]
            }
        ]
    }
