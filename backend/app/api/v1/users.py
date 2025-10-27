from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.models.user import User

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
