"""
AWS Configuration Module

This module provides centralized AWS client configuration for the SewaSetu backend.
It loads credentials from environment variables and creates boto3 clients with
hardcoded region settings to ensure consistent AWS service routing.
"""
import os
import boto3
from botocore.config import Config
from botocore.exceptions import ProfileNotFound, NoCredentialsError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_aws_client(service_name: str):
    """
    Create and return a configured AWS boto3 client for the specified service.
    
    This function:
    1. Loads AWS credentials from environment variables
    2. Hardcodes the region to 'us-east-1' to avoid routing errors
    3. Handles missing credentials gracefully
    
    Args:
        service_name (str): The AWS service name (e.g., 's3', 'rekognition', 'bedrock-runtime')
    
    Returns:
        boto3.client: A configured boto3 client for the requested service
    
    Raises:
        RuntimeError: If AWS credentials are not properly configured
        
    Example:
        >>> s3_client = get_aws_client('s3')
        >>> rekognition_client = get_aws_client('rekognition')
    """
    try:
        # Load AWS credentials from environment variables
        aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
        aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        aws_region = os.getenv("AWS_REGION", "us-east-1")  # Default to us-east-1
        
        # Validate that credentials are present
        if not aws_access_key_id or not aws_secret_access_key:
            raise RuntimeError(
                "AWS credentials not found. Please set AWS_ACCESS_KEY_ID and "
                "AWS_SECRET_ACCESS_KEY in your .env file."
            )
        
        # Create a Config object with hardcoded region to us-east-1
        # This is critical for the Amazon AI for Bharat hackathon to avoid routing errors
        aws_config = Config(
            region_name='us-east-1',
            signature_version='v4',
            retries={
                'max_attempts': 3,
                'mode': 'standard'
            }
        )
        
        # Create and return the boto3 client
        client = boto3.client(
            service_name,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
            config=aws_config
        )
        
        print(f"✅ AWS {service_name} client initialized successfully (region: us-east-1)")
        return client
        
    except ProfileNotFound as e:
        # Handle AWS profile not found errors
        print(f"⚠️  AWS Profile Error: {e}")
        raise RuntimeError(
            f"AWS profile not found. Please configure your AWS credentials in .env file."
        ) from e
        
    except NoCredentialsError as e:
        # Handle missing credentials
        print(f"⚠️  AWS Credentials Error: {e}")
        raise RuntimeError(
            "AWS credentials not found. Please set AWS_ACCESS_KEY_ID and "
            "AWS_SECRET_ACCESS_KEY in your .env file."
        ) from e
        
    except Exception as e:
        # Handle any other unexpected errors
        print(f"❌ Unexpected error creating AWS {service_name} client: {e}")
        raise RuntimeError(
            f"Failed to create AWS {service_name} client: {str(e)}"
        ) from e


# Optional: Pre-configured client getters for common services
def get_s3_client():
    """Get a pre-configured S3 client."""
    return get_aws_client('s3')


def get_rekognition_client():
    """Get a pre-configured Rekognition client."""
    return get_aws_client('rekognition')


def get_bedrock_runtime_client():
    """Get a pre-configured Bedrock Runtime client."""
    return get_aws_client('bedrock-runtime')


def get_polly_client():
    """Get a pre-configured Polly client."""
    return get_aws_client('polly')


def get_translate_client():
    """Get a pre-configured Translate client."""
    return get_aws_client('translate')


# Verify configuration on module import
if __name__ == "__main__":
    print("AWS Configuration Module")
    print("=" * 50)
    print(f"AWS_ACCESS_KEY_ID present: {bool(os.getenv('AWS_ACCESS_KEY_ID'))}")
    print(f"AWS_SECRET_ACCESS_KEY present: {bool(os.getenv('AWS_SECRET_ACCESS_KEY'))}")
    print(f"AWS_REGION: {os.getenv('AWS_REGION', 'us-east-1 (default)')}")
    print("=" * 50)
