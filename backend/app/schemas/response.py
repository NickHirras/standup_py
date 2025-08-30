from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any, Union
from datetime import datetime
from enum import Enum

class ResponseStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class QuestionResponseData(BaseModel):
    question_id: int
    text_response: Optional[str] = None
    selected_options: Optional[List[str]] = None
    numeric_response: Optional[float] = None
    date_response: Optional[datetime] = None
    time_response: Optional[str] = None
    file_upload: Optional[Any] = None  # Will be handled separately for file uploads

    @validator('time_response')
    def validate_time_format(cls, v):
        if v is not None:
            try:
                # Validate HH:MM format
                datetime.strptime(v, '%H:%M')
            except ValueError:
                raise ValueError('Time must be in HH:MM format')
        return v

    @validator('numeric_response')
    def validate_numeric_range(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('Numeric response must be between 0 and 100')
        return v

class CeremonyResponseCreate(BaseModel):
    ceremony_id: int
    team_id: int
    question_responses: List[QuestionResponseData]
    notes: Optional[str] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=10)
    energy_level: Optional[int] = Field(None, ge=1, le=10)

class CeremonyResponseUpdate(BaseModel):
    question_responses: Optional[List[QuestionResponseData]] = None
    notes: Optional[str] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=10)
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    status: Optional[ResponseStatus] = None

class QuestionResponseResponse(BaseModel):
    id: int
    question_id: int
    text_response: Optional[str] = None
    selected_options: Optional[List[str]] = None
    numeric_response: Optional[float] = None
    date_response: Optional[datetime] = None
    time_response: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    response_time: datetime
    is_required: bool
    validation_errors: Optional[Any] = None

    model_config = {"from_attributes": True}

class CeremonyResponseResponse(BaseModel):
    id: int
    ceremony_id: int
    user_id: int
    team_id: int
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    is_complete: bool
    status: ResponseStatus
    notes: Optional[str] = None
    mood_rating: Optional[int] = None
    energy_level: Optional[int] = None
    question_responses: List[QuestionResponseResponse]

    model_config = {"from_attributes": True}

class CeremonyResponseList(BaseModel):
    id: int
    ceremony_id: int
    user_id: int
    team_id: int
    submitted_at: datetime
    completed_at: Optional[datetime] = None
    is_complete: bool
    status: ResponseStatus
    notes: Optional[str] = None
    mood_rating: Optional[int] = None
    energy_level: Optional[int] = None
    question_responses_count: int

    model_config = {"from_attributes": True}

class ResponseAttachmentCreate(BaseModel):
    question_response_id: int
    file_name: str
    file_size: int
    file_type: str
    mime_type: Optional[str] = None

class ResponseAttachmentResponse(BaseModel):
    id: int
    question_response_id: int
    file_path: str
    file_name: str
    file_size: int
    file_type: str
    mime_type: Optional[str] = None
    uploaded_at: datetime
    uploaded_by: int
    is_valid: bool
    validation_errors: Optional[Any] = None

    model_config = {"from_attributes": True}

class ResponseSummary(BaseModel):
    ceremony_id: int
    total_responses: int
    completion_rate: float
    average_mood: Optional[float] = None
    average_energy: Optional[float] = None
    question_summaries: List[dict]

class QuestionResponseSummary(BaseModel):
    question_id: int
    question_text: str
    question_type: str
    total_responses: int
    response_summary: dict  # Varies by question type
    completion_rate: float
