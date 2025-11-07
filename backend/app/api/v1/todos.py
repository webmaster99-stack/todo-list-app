from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.todo import (
    TodoCreate, 
    TodoResponse, 
    TodoUpdate,
    TodoListResponse,
    PaginationMetadata,
    SortField,
    SortOrder
)
from app.api.deps import get_current_user
from app.models.user import User
from app.services.todo import (
    create_todo, 
    get_user_todos, 
    calculate_total_pages,
    get_todo_by_id,
    update_todo,
    complete_and_delete_todo,
    delete_todo
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


@router.get("/{todo_id}", response_model=TodoResponse)
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


@router.put("/{todo_id}", response_model=Optional[TodoResponse])
def update_todo_endpoint(
    todo_id: str = Path(..., description="Todo ID (UUID)"),
    update_data: TodoUpdate = ...,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a todo.
    
    Requires authentication. Users can only update their own todos.
    All fields are optional - provide only the fields you want to update.
    
    **IMPORTANT**: If you set is_completed to true, the todo will be automatically
    deleted and this endpoint will return 204 No Content (as per requirements).
    
    - **title**: New title (optional, max 200 characters)
    - **description**: New description (optional)
    - **priority**: New priority (optional, must be 'low', 'medium', or 'high')
    - **due_date**: New due date (optional, format: YYYY-MM-DD)
    - **is_completed**: Completion status (optional, boolean) - **AUTO-DELETES if set to true**
    
    Returns 404 if todo doesn't exist or doesn't belong to the user.
    Returns 204 No Content if todo was marked complete and deleted.
    """
    # Get todo with authorization check
    todo = get_todo_by_id(db, todo_id, str(current_user.id))
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    try:
        # Update the todo (may return None if completed and deleted)
        updated_todo = update_todo(db, todo, update_data)
        
        # If None, todo was completed and deleted
        if updated_todo is None:
            return None  # FastAPI will return 204 No Content
        
        # Convert to response format
        todo_dict = {
            "id": str(updated_todo.id),
            "user_id": str(updated_todo.user_id),
            "title": updated_todo.title,
            "description": updated_todo.description,
            "priority": updated_todo.priority,
            "due_date": updated_todo.due_date,
            "is_completed": updated_todo.is_completed,
            "created_at": updated_todo.created_at,
            "updated_at": updated_todo.updated_at
        }
        
        return TodoResponse(**todo_dict)
    
    except ValueError as e:
        # No fields provided or validation error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating todo: {str(e)}"
        )


@router.post("/{todo_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
def complete_todo(
    todo_id: str = Path(..., description="Todo ID (UUID)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a todo as completed and delete it.
    
    **WARNING: This action is irreversible!**
    
    Requires authentication. Users can only complete their own todos.
    The todo is automatically deleted when marked as completed (as per requirements).
    
    - **todo_id**: UUID of the todo to complete
    
    Returns 204 No Content on success.
    Returns 404 if todo doesn't exist or doesn't belong to the user.
    """
    # Get todo with authorization check
    todo = get_todo_by_id(db, todo_id, str(current_user.id))
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Complete and delete the todo
    complete_and_delete_todo(db, todo)
    
    # Return 204 No Content
    return None


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo_endpoint(
    todo_id: str = Path(..., description="Todo ID (UUID)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a todo (hard delete).
    
    **WARNING: This action is irreversible!**
    
    Requires authentication. Users can only delete their own todos.
    
    - **todo_id**: UUID of the todo to delete
    
    Returns 204 No Content on success.
    Returns 404 if todo doesn't exist or doesn't belong to the user.
    """
    # Get todo with authorization check
    todo = get_todo_by_id(db, todo_id, str(current_user.id))
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    # Delete the todo
    delete_todo(db, todo)
    
    # Return 204 No Content
    return None