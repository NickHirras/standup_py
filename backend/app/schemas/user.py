from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: str
    role: str = "user"
    company_id: int
    timezone: str = "UTC"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    company_id: Optional[int] = None
    timezone: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class UserListResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    full_name: str
    role: str
    company_id: int
    timezone: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}
