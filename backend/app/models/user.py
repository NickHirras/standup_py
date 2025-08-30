from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    avatar_url = Column(String, nullable=True)
    timezone = Column(String, default="UTC")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Company relationship
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    company = relationship("Company", back_populates="users")
    
    # Team relationships
    team_memberships = relationship("TeamMember", back_populates="user")
    team_managements = relationship("TeamManager", back_populates="user")
    
    # Work schedule
    work_schedule = relationship("WorkSchedule", back_populates="user", uselist=False)
    
    # Ceremony responses
    ceremony_responses = relationship("CeremonyResponse", back_populates="user")
    
    # Notifications
    notifications = relationship("Notification", back_populates="user")
