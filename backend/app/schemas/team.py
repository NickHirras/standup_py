from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None

class TeamCreate(TeamBase):
    company_id: int

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class TeamResponse(TeamBase):
    id: int
    company_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TeamListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    company_id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class TeamMemberCreate(BaseModel):
    team_id: int
    user_id: int

class TeamMemberResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

class TeamManagerCreate(BaseModel):
    team_id: int
    user_id: int
    permissions: Optional[str] = None

class TeamManagerResponse(BaseModel):
    id: int
    team_id: int
    user_id: int
    permissions: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
