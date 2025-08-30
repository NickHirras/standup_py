from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class CeremonyCadence(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    BI_WEEKLY = "bi_weekly"
    MONTHLY = "monthly"
    CUSTOM = "custom"

class CeremonyStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"

class Ceremony(Base):
    __tablename__ = "ceremonies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    cadence = Column(String, nullable=False)
    custom_schedule = Column(JSON, nullable=True)  # JSON for custom scheduling rules
    start_time = Column(Time, nullable=False)
    timezone = Column(String, default="UTC")
    is_active = Column(Boolean, default=True)
    status = Column(String, default=CeremonyStatus.ACTIVE)
    
    # Notification settings
    send_notifications = Column(Boolean, default=True)
    notification_lead_time = Column(Integer, default=15)  # minutes before ceremony
    
    # Chat integration
    chat_notifications_enabled = Column(Boolean, default=False)
    chat_webhook_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="ceremonies")
    questions = relationship("CeremonyQuestion", back_populates="ceremony", order_by="CeremonyQuestion.order_index")
    responses = relationship("CeremonyResponse", back_populates="ceremony")

class CeremonyQuestion(Base):
    __tablename__ = "ceremony_questions"

    id = Column(Integer, primary_key=True, index=True)
    ceremony_id = Column(Integer, ForeignKey("ceremonies.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    order_index = Column(Integer, default=0)
    is_required = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ceremony = relationship("Ceremony", back_populates="questions")
    question = relationship("Question")

class CeremonyResponse(Base):
    __tablename__ = "ceremony_responses"

    id = Column(Integer, primary_key=True, index=True)
    ceremony_id = Column(Integer, ForeignKey("ceremonies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    response_text = Column(Text, nullable=True)
    response_value = Column(JSON, nullable=True)  # JSON for complex responses
    file_url = Column(String, nullable=True)  # For file upload responses
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    ceremony = relationship("Ceremony", back_populates="responses")
    user = relationship("User", back_populates="ceremony_responses")
    question = relationship("Question")
