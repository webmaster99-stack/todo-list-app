from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import (
    Token, 
    LoginRequest, 
    MessageResponse, 
    PasswordResetRequest, 
    PasswordResetConfirm,
    PasswordResetResponse
)
from app.services.auth import create_user, authenticate_user, get_user_by_username
from app.utils.security import create_token_for_user, get_user_id_from_token, get_token_expiry
from app.utils.token_blacklist import token_blacklist
from app.api.deps import get_current_user, get_current_token
from app.models.user import User

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


@router.post("/refresh", response_model=Token)
def refresh_token(
    current_user: User = Depends(get_current_user),
    current_token: str = Depends(get_current_token)
):
    """
    Refresh access token.
    
    Requires a valid (non-expired, non-blacklisted) JWT token.
    Returns a new JWT token and blacklists the old one.
    """
    # Blacklist the old token
    token_expiry = get_token_expiry(current_token)
    if token_expiry:
        token_blacklist.add(current_token, token_expiry)
    
    # Create new token
    new_token = create_token_for_user(str(current_user.id), current_user.username)
    
    return Token(access_token=new_token, token_type="bearer")


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    current_token: str = Depends(get_current_token),
    current_user: User = Depends(get_current_user)
):
    """
    Logout the current user.
    
    Blacklists the current token to prevent further use.
    """
    # Get token expiry and add to blacklist
    token_expiry = get_token_expiry(current_token)
    if token_expiry:
        token_blacklist.add(current_token, token_expiry)
    
    # 204 No Content - successful logout with no response body
    return None


@router.post("/request-password-reset", response_model=PasswordResetResponse)
def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request a password reset token.
    
    Sends a password reset link to the user (simulated via console for now).
    Always returns success message to prevent username enumeration.
    """
    from app.services.password_reset import create_reset_token
    from app.schemas.auth import PasswordResetResponse
    
    # Look up user
    user = get_user_by_username(db, reset_request.username)
    
    # Always return success message (prevent username enumeration)
    response_message = "If the username exists, a password reset link has been sent."
    
    if user and user.is_active:
        # Create reset token
        reset_token = create_reset_token(db, user, expiry_hours=1)
        
        # In production, send email here
        # For now, print to console
        reset_link = f"http://localhost:5173/reset-password?token={reset_token.token}"
        print("\n" + "="*80)
        print("PASSWORD RESET REQUESTED")
        print("="*80)
        print(f"User: {user.username}")
        print(f"Token: {reset_token.token}")
        print(f"Reset Link: {reset_link}")
        print(f"Expires: {reset_token.expires_at}")
        print("="*80 + "\n")
        
        # TODO: Replace with actual email sending
        # send_email(
        #     to=user.email,
        #     subject="Password Reset Request",
        #     body=f"Click here to reset your password: {reset_link}"
        # )
    
    return PasswordResetResponse(message=response_message)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Reset password using a valid reset token.
    
    The token must be:
    - Valid (exists in database)
    - Not expired (within 1 hour)
    - Not used previously
    """
    from app.services.password_reset import use_reset_token
    from app.schemas.auth import MessageResponse
    
    # Attempt to use the reset token
    success = use_reset_token(db, reset_data.token, reset_data.new_password)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    return MessageResponse(message="Password has been reset successfully")