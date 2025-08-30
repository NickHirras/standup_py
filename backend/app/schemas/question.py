from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class QuestionBase(BaseModel):
    text: str
    question_type: str
    is_required: bool = True
    order_index: int = 0
    help_text: Optional[str] = None
    validation_rules: Optional[Any] = None
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    min_label: Optional[str] = None
    max_label: Optional[str] = None
    allowed_file_types: Optional[List[str]] = None
    max_file_size: Optional[int] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    question_type: Optional[str] = None
    is_required: Optional[bool] = None
    order_index: Optional[int] = None
    help_text: Optional[str] = None
    validation_rules: Optional[Any] = None
    min_value: Optional[int] = None
    max_value: Optional[int] = None
    min_label: Optional[str] = None
    max_label: Optional[str] = None
    allowed_file_types: Optional[List[str]] = None
    max_file_size: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class QuestionListResponse(BaseModel):
    id: int
    text: str
    question_type: str
    is_required: bool
    order_index: int
    help_text: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class QuestionOptionCreate(BaseModel):
    question_id: int
    text: str
    value: str
    order_index: int = 0
    is_correct: bool = False

class QuestionOptionResponse(BaseModel):
    id: int
    question_id: int
    text: str
    value: str
    order_index: int
    is_correct: bool
    created_at: datetime

    model_config = {"from_attributes": True}
