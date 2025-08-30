from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CeremonyResponse(Base):
    __tablename__ = "ceremony_responses"

    id = Column(Integer, primary_key=True, index=True)
    ceremony_id = Column(Integer, ForeignKey("ceremonies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Response metadata
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    is_complete = Column(Boolean, default=False)
    
    # Response status
    status = Column(String, default="draft")  # draft, submitted, completed, archived
    
    # Additional metadata
    notes = Column(Text, nullable=True)
    mood_rating = Column(Integer, nullable=True)  # 1-10 scale
    energy_level = Column(Integer, nullable=True)  # 1-10 scale
    
    # Relationships
    ceremony = relationship("Ceremony", back_populates="responses")
    user = relationship("User", back_populates="ceremony_responses")
    team = relationship("Team", back_populates="ceremony_responses")
    question_responses = relationship("QuestionResponse", back_populates="ceremony_response", cascade="all, delete-orphan")

class QuestionResponse(Base):
    __tablename__ = "question_responses"

    id = Column(Integer, primary_key=True, index=True)
    ceremony_response_id = Column(Integer, ForeignKey("ceremony_responses.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    
    # Response data based on question type
    text_response = Column(Text, nullable=True)  # For short_answer, paragraph
    selected_options = Column(JSON, nullable=True)  # For multiple_choice, checkboxes, dropdown
    numeric_response = Column(Float, nullable=True)  # For linear_scale
    date_response = Column(DateTime(timezone=True), nullable=True)  # For date
    time_response = Column(String, nullable=True)  # For time (HH:MM format)
    
    # File upload response
    file_path = Column(String, nullable=True)
    file_name = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String, nullable=True)
    
    # Response metadata
    response_time = Column(DateTime(timezone=True), server_default=func.now())
    is_required = Column(Boolean, default=True)
    validation_errors = Column(JSON, nullable=True)
    
    # Relationships
    ceremony_response = relationship("CeremonyResponse", back_populates="question_responses")
    question = relationship("Question")

class ResponseAttachment(Base):
    __tablename__ = "response_attachments"

    id = Column(Integer, primary_key=True, index=True)
    question_response_id = Column(Integer, ForeignKey("question_responses.id"), nullable=False)
    
    # File information
    file_path = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    
    # Upload metadata
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File validation
    is_valid = Column(Boolean, default=True)
    validation_errors = Column(JSON, nullable=True)
    
    # Relationships
    question_response = relationship("QuestionResponse")
    user = relationship("User")
