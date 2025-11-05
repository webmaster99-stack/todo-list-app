from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.todo import (
    TodoCreate, 
    TodoResponse, 
    TodoListResponse,
    PaginationMetadata,
    SortField,
    SortOrder
)
from app.api.deps import get_current_user
from app.models.user import User
from app.services.todo import (
    create_todo,
    get_todo_by_id, 
    get_user_todos, 
    calculate_total_pages
)

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


@router.get("/", response_model=TodoListResponse)
def list_todos(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    sort_by: SortField = Query(SortField.CREATED_AT, description="Field to sort by"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order (asc or desc)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List todos for the authenticated user.
    
    Returns only uncompleted todos by default (as per requirements).
    
    - **page**: Page number (default: 1, minimum: 1)
    - **page_size**: Items per page (default: 20, minimum: 1, maximum: 100)
    - **sort_by**: Field to sort by (default: created_at)
      - created_at: Sort by creation date
      - due_date: Sort by due date
      - priority: Sort by priority (high > medium > low > none)
    - **sort_order**: Sort order (default: desc)
      - asc: Ascending (oldest/earliest/lowest first)
      - desc: Descending (newest/latest/highest first)
    
    Returns paginated list of todos with metadata.
    """
    try:
        # Get todos (only uncompleted, with sorting)
        todos, total = get_user_todos(
            db, 
            str(current_user.id), 
            page=page, 
            page_size=page_size,
            only_uncompleted=True,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # Convert todos to response format
        todo_responses = []
        for todo in todos:
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
            todo_responses.append(TodoResponse(**todo_dict))
        
        # Calculate pagination metadata
        total_pages = calculate_total_pages(total, page_size)
        
        pagination = PaginationMetadata(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
        
        return TodoListResponse(
            todos=todo_responses,
            pagination=pagination
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching todos: {str(e)}"
        )


router.get("/{todo_id}", response_model=TodoResponse)
def get_todo(
    todo_id: str = Path(..., description="Todo ID (UUID)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single todo by ID.
    
    Requires authentication. Users can only access their own todos.
    
    - **todo_id**: UUID of the todo to retrieve
    
    Returns 404 if todo doesn't exist or doesn't belong to the user.
    """
    # Get todo with authorization check
    todo = get_todo_by_id(db, todo_id, str(current_user.id))
    
    if not todo:
        # Return 404 whether todo doesn't exist or belongs to another user
        # This prevents information leakage about other users' todos
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
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