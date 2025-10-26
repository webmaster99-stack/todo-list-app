from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.services.auth import get_user_by_username
from app.utils.security import hash_password


def generate_reset_token() -> str:
    """
    Generate a secure random reset token.
    
    Returns:
        URL-safe random token string (64 characters)
    """
    return secrets.token_urlsafe(32)


def create_reset_token(db: Session, user: User, expiry_hours: int = 1) -> PasswordResetToken:
    """
    Create a password reset token for a user.
    
    Args:
        db: Database session
        user: User object
        expiry_hours: Hours until token expires (default 1)
        
    Returns:
        Created PasswordResetToken object
    """
    # Generate unique token
    token_string = generate_reset_token()
    
    # Calculate expiry time (timezone-aware)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=expiry_hours)
    
    # Create token record
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token_string,
        expires_at=expires_at
    )
    
    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)
    
    return reset_token


def get_reset_token(db: Session, token: str) -> Optional[PasswordResetToken]:
    """
    Retrieve a password reset token.
    
    Args:
        db: Database session
        token: Reset token string
        
    Returns:
        PasswordResetToken object if found, None otherwise
    """
    return db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()


def validate_reset_token(db: Session, token: str) -> Optional[User]:
    """
    Validate a password reset token and return the associated user.
    
    Args:
        db: Database session
        token: Reset token string
        
    Returns:
        User object if token is valid, None otherwise
        
    Token is valid if:
    - Token exists in database
    - Token has not expired
    - Token has not been used
    """
    reset_token = get_reset_token(db, token)
    
    if not reset_token:
        return None
    
    # Get current time (timezone-aware)
    now = datetime.now(timezone.utc)
    
    # Convert expires_at to timezone-aware if it's naive
    expires_at = reset_token.expires_at
    if expires_at.tzinfo is None:
        # If stored as naive, treat it as UTC
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    # Check if token has expired
    if expires_at < now:
        return None
    
    # Check if token has been used
    if reset_token.used:
        return None
    
    # Get and return the user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    return user


def use_reset_token(db: Session, token: str, new_password: str) -> bool:
    """
    Use a password reset token to change user's password.
    
    Args:
        db: Database session
        token: Reset token string
        new_password: New password to set
        
    Returns:
        True if password was changed successfully, False otherwise
    """
    # Validate token and get user
    user = validate_reset_token(db, token)
    
    if not user:
        return False
    
    # Update user password
    user.password_hash = hash_password(new_password)
    
    # Mark token as used
    reset_token = get_reset_token(db, token)
    reset_token.used = True
    
    # Commit changes
    db.commit()
    
    return True


def invalidate_user_tokens(db: Session, user_id: str) -> int:
    """
    Invalidate all unused password reset tokens for a user.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Number of tokens invalidated
    """
    tokens = db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user_id,
        PasswordResetToken.used == False
    ).all()
    
    count = 0
    for token in tokens:
        token.used = True
        count += 1
    
    db.commit()
    return count


def cleanup_expired_tokens(db: Session) -> int:
    """
    Delete expired password reset tokens from database.
    
    Args:
        db: Database session
        
    Returns:
        Number of tokens deleted
    """
    # Get current time (timezone-aware)
    now = datetime.now(timezone.utc)
    
    # Query for expired tokens
    expired_tokens = db.query(PasswordResetToken).all()
    
    deleted_count = 0
    for token in expired_tokens:
        expires_at = token.expires_at
        
        # Convert to timezone-aware if naive
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        # Delete if expired
        if expires_at < now:
            db.delete(token)
            deleted_count += 1
    
    db.commit()
    return deleted_count