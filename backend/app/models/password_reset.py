from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.models.user import GUID


class PasswordResetToken(Base):
    """
    Password reset token model.
    
    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User
        token: Unique reset token string
        expires_at: When the token expires
        used: Whether the token has been used
        created_at: When the token was created
    """
    __tablename__ = "password_reset_tokens"
    
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
    token = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True
    )
    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )
    used = Column(
        Boolean,
        default=False,
        nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    
    # Relationship to User
    user = relationship("User", backref="password_reset_tokens")
    
    def __repr__(self):
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id}, used={self.used})>"