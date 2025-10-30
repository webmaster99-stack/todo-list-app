from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.user import UserUpdate
from app.utils.security import hash_password
from app.services.auth import get_user_by_username


def update_user_profile(
    db: Session,
    user: User,
    update_data: UserUpdate
) -> User:
    """
    Update user profile (username and/or password).
    
    Args:
        db: Database session
        user: User object to update
        update_data: UserUpdate schema with new values
        
    Returns:
        Updated User object
        
    Raises:
        ValueError: If new username is already taken by another user
    """
    # Check if at least one field is being updated
    if update_data.username is None and update_data.password is None:
        raise ValueError("At least one field (username or password) must be provided")
    
    # Update username if provided
    if update_data.username is not None:
        # Check if new username is different from current
        if update_data.username != user.username:
            # Check if username is already taken by another user
            existing_user = get_user_by_username(db, update_data.username)
            if existing_user and existing_user.id != user.id:
                raise ValueError("Username already taken")
            
            # Update username
            user.username = update_data.username
    
    # Update password if provided
    if update_data.password is not None:
        # Hash the new password
        user.password_hash = hash_password(update_data.password)
    
    # Commit changes (updated_at will be automatically updated by SQLAlchemy)
    db.commit()
    db.refresh(user)
    
    return user


def deactivate_user(db: Session, user: User) -> User:
    """
    Deactivate a user account (soft delete).
    
    Args:
        db: Database session
        user: User object to deactivate
        
    Returns:
        Updated User object with is_active=False
    """
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return user


def delete_user(db: Session, user: User) -> None:
    """
    Permanently delete a user account (hard delete).
    
    Manually deletes related records before deleting user
    to ensure cascade works on all databases (including SQLite).
    
    Args:
        db: Database session
        user: User object to delete
    """
    # Manually delete related password reset tokens
    # This ensures cascade delete works even if foreign keys aren't enforced
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id
    ).delete(synchronize_session=False)
    
    # Delete the user
    db.delete(user)
    
    # Commit all changes
    db.commit()