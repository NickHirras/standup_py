from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, time

class CeremonyBase(BaseModel):
    name: str
    description: Optional[str] = None
    cadence: str
    start_time: time
    timezone: str = "UTC"
    send_notifications: bool = True
    notification_lead_time: int = 15
    chat_notifications_enabled: bool = False
    chat_webhook_url: Optional[str] = None

class CeremonyCreate(CeremonyBase):
    team_id: int

class CeremonyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cadence: Optional[str] = None
    start_time: Optional[time] = None
    timezone: Optional[str] = None
    send_notifications: Optional[bool] = None
    notification_lead_time: Optional[int] = None
    chat_notifications_enabled: Optional[bool] = None
    chat_webhook_url: Optional[str] = None
    is_active: Optional[bool] = None
    status: Optional[str] = None

class Ceremony(CeremonyBase):
    id: int
    team_id: int
    is_active: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class CeremonyListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    team_id: int
    cadence: str
    start_time: time
    timezone: str
    is_active: bool
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}

class CeremonyQuestionCreate(BaseModel):
    ceremony_id: int
    question_id: int
    order_index: int = 0
    is_required: bool = True

class CeremonyQuestionResponse(BaseModel):
    id: int
    ceremony_id: int
    question_id: int
    order_index: int
    is_required: bool
    created_at: datetime

    model_config = {"from_attributes": True}
