from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional
from app.utils.validators import validate_username, validate_password


class UserCreate(BaseModel):
    """Schema for user registration request."""
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Username (3-50 characters, alphanumeric, underscore, hyphen)"
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Password (min 8 characters, must contain uppercase, lowercase, and digit)"
    )
    
    @field_validator('username')
    @classmethod
    def validate_username_field(cls, v: str) -> str:
        """Validate username format."""
        is_valid, error_msg = validate_username(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: str) -> str:
        """Validate password strength."""
        is_valid, error_msg = validate_password(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "password": "SecurePass123"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (never includes password)."""
    id: str
    username: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # Allows creation from ORM models
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "username": "johndoe",
                "is_active": True,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    username: Optional[str] = Field(
        None,
        min_length=3,
        max_length=50,
        description="New username (optional)"
    )
    password: Optional[str] = Field(
        None,
        min_length=8,
        description="New password (optional)"
    )
    
    @field_validator('username')
    @classmethod
    def validate_username_field(cls, v: Optional[str]) -> Optional[str]:
        """Validate username format if provided."""
        if v is not None:
            is_valid, error_msg = validate_username(v)
            if not is_valid:
                raise ValueError(error_msg)
        return v
    
    @field_validator('password')
    @classmethod
    def validate_password_field(cls, v: Optional[str]) -> Optional[str]:
        """Validate password strength if provided."""
        if v is not None:
            is_valid, error_msg = validate_password(v)
            if not is_valid:
                raise ValueError(error_msg)
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "newusername",
                "password": "NewSecurePass123"
            }
        }


class UserDelete(BaseModel):
    """Schema for account deletion confirmation."""
    password: str = Field(
        ...,
        description="Current password for confirmation"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "password": "MyCurrentPassword123"
            }
        }