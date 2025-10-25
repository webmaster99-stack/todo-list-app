from pydantic import BaseModel, Field, field_validator


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: str
    username: str


class LoginRequest(BaseModel):
    """Schema for login request."""
    username: str = Field(..., description="Username")
    password: str = Field(..., description="Password")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "password": "SecurePass123"
            }
        }


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation successful"
            }
        }


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""
    username: str = Field(..., description="Username or email")
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe"
            }
        }


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation."""
    token: str = Field(..., description="Reset token from email")
    new_password: str = Field(
        ...,
        min_length=8,
        description="New password"
    )
    
    @field_validator('new_password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        """Validate password strength."""
        from app.utils.validators import validate_password
        is_valid, error_msg = validate_password(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123def456...",
                "new_password": "NewSecurePass123"
            }
        }


class PasswordResetResponse(BaseModel):
    """Schema for password reset request response."""
    message: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "If the username exists, a password reset link has been sent."
            }
        }