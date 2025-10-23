from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token, LoginRequest
from app.services.auth import create_user, authenticate_user
from app.utils.security import create_token_for_user

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    
    - **username**: 3-50 characters, alphanumeric with underscore/hyphen
    - **password**: Minimum 8 characters with uppercase, lowercase, and digit
    
    Returns the created user (without password).
    """
    try:
        user = create_user(db, user_data)
        
        # Convert UUID to string for response
        user_dict = {
            "id": str(user.id),
            "username": user.username,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        
        return UserResponse(**user_dict)
    
    except ValueError as e:
        # Username already exists
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during registration: {str(e)}"
        )


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with username and password.
    
    Returns a JWT access token valid for 24 hours.
    """
    user = authenticate_user(db, login_data.username, login_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_token_for_user(str(user.id), user.username)
    
    return Token(access_token=access_token, token_type="bearer")