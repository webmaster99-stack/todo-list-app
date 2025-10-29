from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate, UserDelete
from app.api.deps import get_current_user, get_current_token
from app.models.user import User
from app.services.user import update_user_profile, delete_user
from app.utils.security import verify_password, get_token_expiry
from app.utils.token_blacklist import token_blacklist

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


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(
    delete_data: UserDelete,
    current_user: User = Depends(get_current_user),
    current_token: str = Depends(get_current_token),
    db: Session = Depends(get_db)
):
    """
    Delete current user's account permanently.
    
    **WARNING: This action is irreversible!**
    
    - Requires password confirmation
    - Permanently deletes user and all related data
    - Blacklists current token
    - Cannot be undone
    """
    # Verify password
    if not verify_password(delete_data.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    # Blacklist current token
    token_expiry = get_token_expiry(current_token)
    if token_expiry:
        token_blacklist.add(current_token, token_expiry)
    
    # Delete user (cascade will delete related data)
    delete_user(db, current_user)
    
    # Return 204 No Content (no response body)
    return None