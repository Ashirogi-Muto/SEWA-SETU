"""
AWS Transcribe Service for SewaSetu

This module provides audio transcription capabilities using Amazon Transcribe
for converting voice reports into text for the SewaSetu civic reporting system.
"""
import json
import time
import uuid
from typing import BinaryIO
import requests

from backend.aws_config import get_aws_client


class TranscribeService:
    """
    Service for transcribing audio files using AWS Transcribe.
    
    This service:
    - Uploads audio files to S3
    - Uses AWS Transcribe to convert speech to text
    - Supports Hindi and English Indian languages
    - Polls for completion and retrieves transcripts
    """
    
    def __init__(self):
        """Initialize the Transcribe service with S3 and Transcribe clients."""
        self.s3_client = get_aws_client('s3')
        self.transcribe_client = get_aws_client('transcribe')
        
        # S3 bucket configuration
        self.bucket_name = 'sewasetu-audio-uploads'
        
        print(f"🎤 TranscribeService initialized with bucket: {self.bucket_name}")
    
    def transcribe_audio(
        self, 
        file_obj: BinaryIO, 
        filename: str,
        language_code: str = 'hi-IN',
        media_format: str = None
    ) -> str:
        """
        Transcribe an audio file to text using AWS Transcribe.
        
        This method:
        1. Uploads the audio file to S3
        2. Starts a transcription job
        3. Polls until the job completes
        4. Downloads and parses the transcript
        5. Returns the transcribed text
        
        Args:
            file_obj (BinaryIO): File object containing audio data
            filename (str): Name of the audio file
            language_code (str): Language code. Default 'hi-IN' (Hindi).
                                Options: 'hi-IN' (Hindi), 'en-IN' (English)
            media_format (str): Audio format. Auto-detected from filename if None.
                               Options: 'mp3', 'wav', 'flac', 'm4a', 'ogg', 'webm'
        
        Returns:
            str: The transcribed text from the audio
        
        Raises:
            RuntimeError: If AWS Transcribe is not active or transcription fails
            
        Example:
            >>> service = TranscribeService()
            >>> with open('report.mp3', 'rb') as audio:
            >>>     text = service.transcribe_audio(audio, 'report.mp3')
            >>> print(text)
            'सड़क पर बहुत बड़ा गड्ढा है'
        """
        try:
            # Auto-detect media format from filename if not provided
            if media_format is None:
                media_format = self._detect_media_format(filename)
            
            # Generate unique identifiers
            file_key = f"audio/{uuid.uuid4()}_{filename}"
            job_name = f"transcribe-{uuid.uuid4()}"
            
            print(f"📤 Step 1/4: Uploading audio to S3 bucket '{self.bucket_name}'...")
            
            # Step 1: Upload audio file to S3
            try:
                self.s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=file_key,
                    Body=file_obj,
                    ContentType=f'audio/{media_format}'
                )
                print(f"✅ Upload complete: s3://{self.bucket_name}/{file_key}")
            except Exception as e:
                print(f"❌ S3 upload failed: {e}")
                raise RuntimeError(f"Failed to upload audio to S3: {str(e)}") from e
            
            # Construct S3 URI for Transcribe
            media_uri = f"s3://{self.bucket_name}/{file_key}"
            
            print(f"🎙️  Step 2/4: Starting transcription job '{job_name}'...")
            print(f"    Language: {language_code}, Format: {media_format}")
            
            # Step 2: Start transcription job
            try:
                self.transcribe_client.start_transcription_job(
                    TranscriptionJobName=job_name,
                    LanguageCode=language_code,
                    MediaFormat=media_format,
                    Media={'MediaFileUri': media_uri},
                    OutputBucketName=self.bucket_name
                )
                print(f"✅ Transcription job started successfully")
            except self.transcribe_client.exceptions.BadRequestException as e:
                error_msg = str(e)
                if 'not subscribed' in error_msg.lower() or 'not authorized' in error_msg.lower():
                    raise RuntimeError(
                        "AWS Transcribe not active. Please enable Amazon Transcribe "
                        "in your AWS account or check your subscription status."
                    ) from e
                raise RuntimeError(f"AWS Transcribe error: {error_msg}") from e
            except Exception as e:
                print(f"❌ Failed to start transcription job: {e}")
                raise RuntimeError(f"Failed to start transcription: {str(e)}") from e
            
            print(f"⏳ Step 3/4: Polling for job completion (checking every 2 seconds)...")
            
            # Step 3: Poll for completion
            max_attempts = 60  # Maximum 2 minutes (60 * 2 seconds)
            attempt = 0
            
            while attempt < max_attempts:
                attempt += 1
                time.sleep(2)
                
                try:
                    response = self.transcribe_client.get_transcription_job(
                        TranscriptionJobName=job_name
                    )
                    
                    job = response['TranscriptionJob']
                    status = job['TranscriptionJobStatus']
                    
                    print(f"    Attempt {attempt}: Status = {status}")
                    
                    if status == 'COMPLETED':
                        print(f"✅ Transcription completed successfully!")
                        
                        # Step 4: Download and parse transcript
                        transcript_uri = job['Transcript']['TranscriptFileUri']
                        print(f"📥 Step 4/4: Downloading transcript from {transcript_uri}")
                        
                        transcript_text = self._download_transcript(transcript_uri)
                        
                        # Cleanup: Delete the audio file from S3
                        try:
                            self.s3_client.delete_object(
                                Bucket=self.bucket_name,
                                Key=file_key
                            )
                            print(f"🗑️  Cleaned up audio file from S3")
                        except Exception as e:
                            print(f"⚠️  Warning: Could not delete audio file: {e}")
                        
                        print(f"✅ Transcription complete! Text length: {len(transcript_text)} chars")
                        return transcript_text
                    
                    elif status == 'FAILED':
                        failure_reason = job.get('FailureReason', 'Unknown error')
                        print(f"❌ Transcription failed: {failure_reason}")
                        raise RuntimeError(f"Transcription job failed: {failure_reason}")
                    
                    # Status is IN_PROGRESS, continue polling
                    
                except Exception as e:
                    if 'RuntimeError' in str(type(e)):
                        raise
                    print(f"⚠️  Error polling transcription job: {e}")
                    raise RuntimeError(f"Error checking transcription status: {str(e)}") from e
            
            # Timeout reached
            raise RuntimeError(
                f"Transcription job timed out after {max_attempts * 2} seconds. "
                f"Job may still be processing."
            )
            
        except RuntimeError:
            # Re-raise RuntimeError as-is (already formatted)
            raise
        except Exception as e:
            print(f"❌ Unexpected error in transcribe_audio: {e}")
            raise RuntimeError(f"Transcription failed: {str(e)}") from e
    
    def _detect_media_format(self, filename: str) -> str:
        """
        Detect media format from filename extension.
        
        Args:
            filename (str): The audio filename
        
        Returns:
            str: The detected media format
        
        Raises:
            ValueError: If the file extension is not supported
        """
        extension = filename.lower().split('.')[-1]
        
        # Map common extensions to AWS Transcribe media formats
        format_map = {
            'mp3': 'mp3',
            'wav': 'wav',
            'flac': 'flac',
            'm4a': 'mp4',
            'mp4': 'mp4',
            'ogg': 'ogg',
            'webm': 'webm',
            'amr': 'amr'
        }
        
        if extension not in format_map:
            raise ValueError(
                f"Unsupported audio format: .{extension}. "
                f"Supported formats: {', '.join(format_map.keys())}"
            )
        
        return format_map[extension]
    
    def _download_transcript(self, transcript_uri: str) -> str:
        """
        Download and parse the transcript JSON from AWS Transcribe.
        
        Args:
            transcript_uri (str): The URI of the transcript JSON file
        
        Returns:
            str: The transcribed text
        
        Raises:
            RuntimeError: If download or parsing fails
        """
        try:
            # Download the transcript JSON
            response = requests.get(transcript_uri, timeout=10)
            response.raise_for_status()
            
            # Parse the JSON
            transcript_data = response.json()
            
            # Extract the transcript text
            # AWS Transcribe returns: {"results": {"transcripts": [{"transcript": "..."}]}}
            transcript_text = transcript_data['results']['transcripts'][0]['transcript']
            
            return transcript_text
            
        except requests.RequestException as e:
            raise RuntimeError(f"Failed to download transcript: {str(e)}") from e
        except (KeyError, IndexError, json.JSONDecodeError) as e:
            raise RuntimeError(f"Failed to parse transcript JSON: {str(e)}") from e


# Singleton instance for easy access
_transcribe_service_instance = None


def get_transcribe_service() -> TranscribeService:
    """
    Get a singleton instance of the TranscribeService.
    
    This ensures we don't create multiple Transcribe clients unnecessarily.
    
    Returns:
        TranscribeService: The singleton TranscribeService instance
    """
    global _transcribe_service_instance
    if _transcribe_service_instance is None:
        _transcribe_service_instance = TranscribeService()
    return _transcribe_service_instance


# Test function for development
if __name__ == "__main__":
    print("Testing TranscribeService")
    print("=" * 60)
    
    service = TranscribeService()
    
    # Example usage (requires actual audio file)
    print("\nTo test, provide an audio file:")
    print(">>> with open('audio.mp3', 'rb') as f:")
    print(">>>     text = service.transcribe_audio(f, 'audio.mp3')")
    print(">>>     print(text)")
