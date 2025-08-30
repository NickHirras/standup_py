from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class NotificationBase(BaseModel):
    type: str
    title: str
    message: str
    channel: str

class NotificationCreate(NotificationBase):
    user_id: int
    metadata: Optional[Any] = None

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    status: str
    metadata: Optional[Any] = None
    sent_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
