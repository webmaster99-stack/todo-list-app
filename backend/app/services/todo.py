from sqlalchemy.orm import Session
from typing import Optional
from app.models.todo import Todo
from app.models.user import User
from app.schemas.todo import TodoCreate


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