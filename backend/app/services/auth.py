from sqlalchemy.orm import Session
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import hash_password, verify_password


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """
    Retrieve a user by username.
    
    Args:
        db: Database session
        username: Username to search for
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.username == username).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    """
    Retrieve a user by ID.
    
    Args:
        db: Database session
        user_id: User ID to search for
        
    Returns:
        User object if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user with hashed password.
    
    Args:
        db: Database session
        user_data: User registration data
        
    Returns:
        Created User object
        
    Raises:
        ValueError: If username already exists
    """
    # Check if username already exists
    existing_user = get_user_by_username(db, user_data.username)
    if existing_user:
        raise ValueError("Username already exists")
    
    # Hash the password
    hashed_password = hash_password(user_data.password)
    
    # Create user object
    db_user = User(
        username=user_data.username,
        password_hash=hashed_password
    )
    
    # Add to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """
    Authenticate a user with username and password.
    
    Args:
        db: Database session
        username: Username
        password: Plain text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = get_user_by_username(db, username)
    
    if not user:
        return None
    
    if not user.is_active:
        return None
    
    if not verify_password(password, user.password_hash):
        return None
    
    return user