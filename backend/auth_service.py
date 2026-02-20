import os
import hashlib
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from typing import Optional

# --- Configuration ---
# We load the secret key from the environment variables
SECRET_KEY = os.getenv("API_SECRET_KEY", "a-default-secret-key-that-is-long")
if len(SECRET_KEY) < 32:
    raise ValueError("SECRET_KEY must be at least 32 characters long for security")
    
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 # The token will be valid for 30 minutes

# --- Password Hashing (Simplified for Hackathon) ---
# Using SHA-256 with salt for simplicity and to avoid bcrypt 72-byte issues
SALT = SECRET_KEY.encode('utf-8')[:16]  # Use first 16 bytes of secret as salt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Checks if a plain password matches a hashed one."""
    try:
        # Hash the plain password and compare
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            SALT,
            100000  # 100,000 iterations
        ).hex()
        return password_hash == hashed_password
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Generates a secure hash for a plain password."""
    # Use PBKDF2-HMAC-SHA256 for password hashing
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        SALT,
        100000  # 100,000 iterations
    )
    return password_hash.hex()


# --- JSON Web Token (JWT) Handling ---
def create_access_token(data: dict) -> str:
    """
    Creates a new JWT access token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[str]:
    """
    Decodes a JWT and returns the user's email (or None if invalid).
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None