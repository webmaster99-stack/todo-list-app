from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime
from typing import Optional, List
from app.models.todo import PriorityLevel


class TodoCreate(BaseModel):
    """Schema for creating a new todo."""
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Todo title (required, max 200 characters)"
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description (optional)"
    )
    priority: Optional[PriorityLevel] = Field(
        None,
        description="Priority level: low, medium, or high (optional)"
    )
    due_date: date = Field(
        ...,
        description="Due date (required)"
    )
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not just whitespace."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or just whitespace")
        return v.strip()
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from description if provided."""
        if v is not None:
            v = v.strip()
            # Convert empty string to None
            if not v:
                return None
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation with examples",
                "priority": "high",
                "due_date": "2024-12-31"
            }
        }


class TodoResponse(BaseModel):
    """Schema for todo response."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    priority: Optional[PriorityLevel]
    due_date: date
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "660e8400-e29b-41d4-a716-446655440001",
                "title": "Complete project documentation",
                "description": "Write comprehensive API documentation with examples",
                "priority": "high",
                "due_date": "2024-12-31",
                "is_completed": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z"
            }
        }


class TodoUpdate(BaseModel):
    """Schema for updating a todo."""
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="New title (optional)"
    )
    description: Optional[str] = Field(
        None,
        description="New description (optional)"
    )
    priority: Optional[PriorityLevel] = Field(
        None,
        description="New priority level (optional)"
    )
    due_date: Optional[date] = Field(
        None,
        description="New due date (optional)"
    )
    is_completed: Optional[bool] = Field(
        None,
        description="Completion status (optional)"
    )
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title is not just whitespace if provided."""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Title cannot be empty or just whitespace")
            return v.strip()
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Strip whitespace from description if provided."""
        if v is not None:
            v = v.strip()
            # Convert empty string to None
            if not v:
                return None
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Updated title",
                "description": "Updated description",
                "priority": "medium",
                "due_date": "2024-12-25",
                "is_completed": False
            }
        }


class PaginationMetadata(BaseModel):
    """Pagination metadata."""
    total: int = Field(..., description="Total number of items")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")
    
    class Config:
        json_schema_extra = {
            "example": {
                "total": 42,
                "page": 1,
                "page_size": 20,
                "total_pages": 3
            }
        }


class TodoListResponse(BaseModel):
    """Schema for paginated todo list response."""
    todos: List[TodoResponse]
    pagination: PaginationMetadata
    
    class Config:
        json_schema_extra = {
            "example": {
                "todos": [
                    {
                        "id": "550e8400-e29b-41d4-a716-446655440000",
                        "user_id": "660e8400-e29b-41d4-a716-446655440001",
                        "title": "Complete project documentation",
                        "description": "Write comprehensive API documentation",
                        "priority": "high",
                        "due_date": "2024-12-31",
                        "is_completed": False,
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:00Z"
                    }
                ],
                "pagination": {
                    "total": 42,
                    "page": 1,
                    "page_size": 20,
                    "total_pages": 3
                }
            }
        }