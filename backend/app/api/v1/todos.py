from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.todo import TodoCreate, TodoResponse
from app.api.deps import get_current_user
from app.models.user import User
from app.services.todo import create_todo

router = APIRouter()


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_new_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new todo.
    
    - **title**: Required, max 200 characters
    - **description**: Optional, can be empty
    - **priority**: Optional, must be 'low', 'medium', or 'high'
    - **due_date**: Required, format: YYYY-MM-DD
    
    The todo is automatically associated with the authenticated user.
    """
    try:
        # Create the todo
        todo = create_todo(db, current_user, todo_data)
        
        # Convert to response format
        todo_dict = {
            "id": str(todo.id),
            "user_id": str(todo.user_id),
            "title": todo.title,
            "description": todo.description,
            "priority": todo.priority,
            "due_date": todo.due_date,
            "is_completed": todo.is_completed,
            "created_at": todo.created_at,
            "updated_at": todo.updated_at
        }
        
        return TodoResponse(**todo_dict)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating todo: {str(e)}"
        )