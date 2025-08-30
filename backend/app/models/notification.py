from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class NotificationType(str, enum.Enum):
    CEREMONY_REMINDER = "ceremony_reminder"
    TEAM_UPDATE = "team_update"
    RESPONSE_RECEIVED = "response_received"
    SYSTEM_ALERT = "system_alert"

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"

class NotificationChannel(str, enum.Enum):
    EMAIL = "email"
    CHAT = "chat"
    IN_APP = "in_app"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String, nullable=False)
    status = Column(String, default=NotificationStatus.PENDING)
    
    # Additional data
    additional_data = Column(JSON, nullable=True)  # JSON for additional data
    sent_at = Column(DateTime(timezone=True), nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    subject = Column(String, nullable=True)  # For email notifications
    title = Column(String, nullable=False)
    message_template = Column(Text, nullable=False)
    variables = Column(JSON, nullable=True)  # JSON array of available variables
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
