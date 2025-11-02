from sqlalchemy.orm import Session
from typing import Optional, Tuple, List
from app.models.todo import Todo
from app.models.user import User
from app.schemas.todo import TodoCreate
import math


def create_todo(db: Session, user: User, todo_data: TodoCreate) -> Todo:
    """
    Create a new todo for a user.
    
    Args:
        db: Database session
        user: User who owns the todo
        todo_data: Todo creation data
        
    Returns:
        Created Todo object
    """
    # Create todo object
    todo = Todo(
        user_id=user.id,
        title=todo_data.title,
        description=todo_data.description,
        priority=todo_data.priority,
        due_date=todo_data.due_date
    )
    
    # Add to database
    db.add(todo)
    db.commit()
    db.refresh(todo)
    
    return todo


def get_todo_by_id(db: Session, todo_id: str, user_id: str) -> Optional[Todo]:
    """
    Get a todo by ID, ensuring it belongs to the user.
    
    Args:
        db: Database session
        todo_id: Todo ID to retrieve
        user_id: User ID for authorization check
        
    Returns:
        Todo object if found and belongs to user, None otherwise
    """
    return db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id
    ).first()


def get_user_todos(
    db: Session,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    only_uncompleted: bool = True
) -> Tuple[List[Todo], int]:
    """
    Get paginated todos for a user.
    
    Args:
        db: Database session
        user_id: User ID
        page: Page number (1-based)
        page_size: Number of items per page
        only_uncompleted: If True, only return uncompleted todos
        
    Returns:
        Tuple of (list of todos, total count)
    """
    # Base query
    query = db.query(Todo).filter(Todo.user_id == user_id)
    
    # Filter by completion status
    if only_uncompleted:
        query = query.filter(Todo.is_completed == False)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    todos = query.offset(offset).limit(page_size).all()
    
    return todos, total


def calculate_total_pages(total: int, page_size: int) -> int:
    """
    Calculate total number of pages.
    
    Args:
        total: Total number of items
        page_size: Items per page
        
    Returns:
        Total number of pages
    """
    return math.ceil(total / page_size) if total > 0 else 1