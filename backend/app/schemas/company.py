from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None

class CompanyResponse(CompanyBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class CompanyListResponse(BaseModel):
    id: int
    name: str
    domain: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
