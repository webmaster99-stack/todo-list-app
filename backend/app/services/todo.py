from sqlalchemy.orm import Session
from sqlalchemy import case
from typing import Optional, Tuple, List
from app.models.todo import Todo, PriorityLevel
from app.models.user import User
from app.schemas.todo import TodoCreate, TodoUpdate, SortField, SortOrder
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


def update_todo(
    db: Session,
    todo: Todo,
    update_data: TodoUpdate
) -> Optional[Todo]:
    """
    Update a todo with new data.
    
    If is_completed is set to True, the todo is automatically deleted
    and None is returned (as per requirements).
    
    Args:
        db: Database session
        todo: Todo object to update
        update_data: TodoUpdate schema with new values
        
    Returns:
        Updated Todo object, or None if todo was completed and deleted
        
    Raises:
        ValueError: If no fields provided for update
    """
    # Check if at least one field is being updated
    update_dict = update_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise ValueError("At least one field must be provided for update")
    
    # Check if marking as completed (auto-delete)
    if update_dict.get('is_completed') == True:
        # Delete the todo instead of updating
        db.delete(todo)
        db.commit()
        return None  # Signal that todo was deleted
    
    # Update fields (excluding is_completed since we handle it above)
    for field, value in update_dict.items():
        if field != 'is_completed':  # Skip is_completed
            setattr(todo, field, value)
    
    # Commit changes (updated_at will be automatically updated)
    db.commit()
    db.refresh(todo)
    
    return todo


def complete_and_delete_todo(db: Session, todo: Todo) -> None:
    """
    Mark a todo as completed and delete it (as per requirements).
    
    This is a non-reversible operation.
    
    Args:
        db: Database session
        todo: Todo object to complete and delete
    """
    # Simply delete the todo
    # No need to mark as completed first since it's being deleted
    db.delete(todo)
    db.commit()


def delete_todo(db: Session, todo: Todo) -> None:
    """
    Delete a todo (hard delete).
    
    Args:
        db: Database session
        todo: Todo object to delete
    """
    db.delete(todo)
    db.commit()


def get_user_todos(
    db: Session,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
    only_uncompleted: bool = True,
    sort_by: SortField = SortField.CREATED_AT,
    sort_order: SortOrder = SortOrder.DESC
) -> Tuple[List[Todo], int]:
    """
    Get paginated and sorted todos for a user.
    
    Args:
        db: Database session
        user_id: User ID
        page: Page number (1-based)
        page_size: Number of items per page
        only_uncompleted: If True, only return uncompleted todos
        sort_by: Field to sort by (created_at, due_date, priority)
        sort_order: Sort order (asc or desc)
        
    Returns:
        Tuple of (list of todos, total count)
    """
    # Base query
    query = db.query(Todo).filter(Todo.user_id == user_id)
    
    # Filter by completion status
    if only_uncompleted:
        query = query.filter(Todo.is_completed == False)
    
    # Apply sorting
    if sort_by == SortField.CREATED_AT:
        sort_column = Todo.created_at
    elif sort_by == SortField.DUE_DATE:
        sort_column = Todo.due_date
    elif sort_by == SortField.PRIORITY:
        # Custom sorting for priority: HIGH > MEDIUM > LOW > NULL
        # When ascending: NULL, LOW, MEDIUM, HIGH
        # When descending: HIGH, MEDIUM, LOW, NULL
        priority_order = case(
            (Todo.priority == PriorityLevel.HIGH, 3),
            (Todo.priority == PriorityLevel.MEDIUM, 2),
            (Todo.priority == PriorityLevel.LOW, 1),
            else_=0  # NULL values
        )
        sort_column = priority_order
    else:
        sort_column = Todo.created_at
    
    # Apply sort order
    if sort_order == SortOrder.DESC:
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())
    
    # Get total count before pagination
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