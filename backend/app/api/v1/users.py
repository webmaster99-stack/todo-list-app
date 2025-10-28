from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate
from app.api.deps import get_current_user
from app.models.user import User
from app.services.user import update_user_profile

router = APIRouter()


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's profile.
    
    Requires valid JWT token in Authorization header.
    Returns the authenticated user's profile information (without password).
    """
    # Convert UUID to string for response
    user_dict = {
        "id": str(current_user.id),
        "username": current_user.username,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }
    
    return UserResponse(**user_dict)


@router.put("/me", response_model=UserResponse)
def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    Can update username, password, or both.
    At least one field must be provided.
    
    - **username**: New username (optional, must be unique)
    - **password**: New password (optional, will be hashed)
    """
    try:
        # Update user profile
        updated_user = update_user_profile(db, current_user, update_data)
        
        # Convert UUID to string for response
        user_dict = {
            "id": str(updated_user.id),
            "username": updated_user.username,
            "is_active": updated_user.is_active,
            "created_at": updated_user.created_at,
            "updated_at": updated_user.updated_at
        }
        
        return UserResponse(**user_dict)
    
    except ValueError as e:
        # Username taken or no fields provided
        if "already taken" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
    except Exception as e:
        # Unexpected error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating profile: {str(e)}"
        )
