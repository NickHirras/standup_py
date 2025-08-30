from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, time

class WorkScheduleBase(BaseModel):
    work_days: List[str]
    start_time: time
    end_time: time
    timezone: str = "UTC"
    notification_time: Optional[time] = None
    use_work_hours: bool = True
    break_times: Optional[List[Any]] = None

class WorkScheduleCreate(WorkScheduleBase):
    user_id: int

class WorkScheduleUpdate(BaseModel):
    work_days: Optional[List[str]] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    notification_time: Optional[time] = None
    use_work_hours: Optional[bool] = None
    break_times: Optional[List[Any]] = None
    is_active: Optional[bool] = None

class WorkScheduleResponse(WorkScheduleBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
