from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import bcrypt
from app.config import settings


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        Hashed password string
        
    Example:
        >>> hashed = hash_password("mypassword123")
        >>> print(hashed)
        $2b$12$...
    """
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    
    # Generate salt and hash password (12 rounds)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a hashed password.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password from database
        
    Returns:
        True if password matches, False otherwise
        
    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    # Convert both to bytes
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    
    # Check password
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary of claims to encode in the token
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
        
    Example:
        >>> token = create_access_token({"sub": "user123", "username": "alice"})
        >>> print(token)
        eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Add expiration to token payload
    to_encode.update({"exp": expire})
    
    # Encode and return token
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Dictionary of token claims if valid, None if invalid or expired
        
    Example:
        >>> token = create_access_token({"sub": "user123"})
        >>> payload = decode_access_token(token)
        >>> print(payload["sub"])
        user123
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def create_token_for_user(user_id: str, username: str) -> str:
    """
    Create an access token for a specific user.
    
    Args:
        user_id: User's unique identifier (UUID as string)
        username: User's username
        
    Returns:
        JWT token string
        
    Example:
        >>> token = create_token_for_user("550e8400-e29b-41d4-a716-446655440000", "alice")
        >>> payload = decode_access_token(token)
        >>> print(payload["sub"])
        550e8400-e29b-41d4-a716-446655440000
    """
    token_data = {
        "sub": user_id,  # 'sub' is the standard JWT claim for subject (user ID)
        "username": username
    }
    return create_access_token(token_data)


def get_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        User ID if token is valid, None otherwise
        
    Example:
        >>> token = create_token_for_user("user123", "alice")
        >>> user_id = get_user_id_from_token(token)
        >>> print(user_id)
        user123
    """
    payload = decode_access_token(token)
    if payload:
        return payload.get("sub")
    return None


def get_token_expiry(token: str) -> Optional[datetime]:
    """
    Extract expiry time from a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Expiry datetime if token is valid, None otherwise
    """
    payload = decode_access_token(token)
    if payload and 'exp' in payload:
        # JWT exp is in Unix timestamp (seconds since epoch)
        # Return as timezone-aware datetime
        return datetime.fromtimestamp(payload['exp'], tz=timezone.utc)
    return None