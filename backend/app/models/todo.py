from sqlalchemy import Column, String, Text, Boolean, Date, DateTime, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.database import Base
from app.models.user import GUID


class PriorityLevel(str, enum.Enum):
    """Priority levels for todos."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Todo(Base):
    """
    Todo model for task management.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User who owns this todo
        title: Todo title (required, max 200 chars)
        description: Detailed description (optional)
        priority: Priority level (low/medium/high, optional)
        due_date: Due date (required)
        is_completed: Completion status (default False)
        created_at: When todo was created
        updated_at: When todo was last updated
    """
    __tablename__ = "todos"
    
    id = Column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
        unique=True,
        nullable=False
    )
    user_id = Column(
        GUID,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    title = Column(
        String(200),
        nullable=False
    )
    description = Column(
        Text,
        nullable=True
    )
    priority = Column(
        SQLEnum(PriorityLevel),
        nullable=True
    )
    due_date = Column(
        Date,
        nullable=False
    )
    is_completed = Column(
        Boolean,
        default=False,
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    # Relationship to User
    user = relationship("User", backref="todos")
    
    # Composite indexes for efficient queries
    __table_args__ = (
        # Index for filtering by user and completion status
        Index('ix_todos_user_completed', 'user_id', 'is_completed'),
        # Index for sorting by creation date
        Index('ix_todos_user_created', 'user_id', 'created_at'),
        # Index for sorting by due date
        Index('ix_todos_user_due_date', 'user_id', 'due_date'),
        # Index for filtering/sorting by priority
        Index('ix_todos_user_priority', 'user_id', 'priority'),
    )
    
    def __repr__(self):
        return f"<Todo(id={self.id}, title='{self.title}', user_id={self.user_id}, completed={self.is_completed})>"