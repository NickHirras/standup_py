from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class QuestionType(str, enum.Enum):
    SHORT_ANSWER = "short_answer"
    PARAGRAPH = "paragraph"
    MULTIPLE_CHOICE = "multiple_choice"
    CHECKBOXES = "checkboxes"
    DROPDOWN = "dropdown"
    FILE_UPLOAD = "file_upload"
    LINEAR_SCALE = "linear_scale"
    MULTIPLE_CHOICE_GRID = "multiple_choice_grid"
    CHECKBOX_GRID = "checkbox_grid"
    DATE = "date"
    TIME = "time"

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    question_type = Column(String, nullable=False)
    is_required = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    help_text = Column(Text, nullable=True)
    validation_rules = Column(JSON, nullable=True)  # JSON for validation rules
    
    # For question types that need options
    options = relationship("QuestionOption", back_populates="question", order_by="QuestionOption.order_index")
    
    # For grid questions
    grid_columns = Column(JSON, nullable=True)  # JSON array of column headers
    grid_rows = Column(JSON, nullable=True)     # JSON array of row labels
    
    # For scale questions
    min_value = Column(Integer, nullable=True)
    max_value = Column(Integer, nullable=True)
    min_label = Column(String, nullable=True)
    max_label = Column(String, nullable=True)
    
    # For file upload questions
    allowed_file_types = Column(JSON, nullable=True)  # JSON array of allowed extensions
    max_file_size = Column(Integer, nullable=True)    # in bytes
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class QuestionOption(Base):
    __tablename__ = "question_options"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    text = Column(String, nullable=False)
    value = Column(String, nullable=False)
    order_index = Column(Integer, default=0)
    is_correct = Column(Boolean, default=False)  # For quiz-like questions
    
    # Relationships
    question = relationship("Question", back_populates="options")
