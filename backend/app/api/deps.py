from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Generator
from app.database import get_db
from app.utils.security import get_user_id_from_token
from app.utils.token_blacklist import token_blacklist
from app.services.auth import get_user_by_id
from app.models.user import User

# Security scheme for JWT bearer token
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Authorization credentials with bearer token
        db: Database session
        
    Returns:
        Current authenticated User object
        
    Raises:
        HTTPException: If token is invalid, blacklisted, or user not found
    """
    token = credentials.credentials
    
    # Check if token is blacklisted
    if token_blacklist.is_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Decode token to get user ID
    user_id = get_user_id_from_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


def get_current_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Dependency to extract the current JWT token.
    
    Args:
        credentials: HTTP Authorization credentials with bearer token
        
    Returns:
        JWT token string
    """
    return credentials.credentials