from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, JSON, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class WorkDay(str, enum.Enum):
    MONDAY = "monday"
    TUESDAY = "tuesday"
    WEDNESDAY = "wednesday"
    THURSDAY = "thursday"
    FRIDAY = "friday"
    SATURDAY = "saturday"
    SUNDAY = "sunday"

class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Work hours
    work_days = Column(JSON, nullable=False)  # JSON array of work days
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    # Timezone
    timezone = Column(String, default="UTC")
    
    # Notification preferences
    notification_time = Column(Time, nullable=True)  # Specific time for notifications
    use_work_hours = Column(Boolean, default=True)  # Send at start of work hours
    
    # Break times
    break_times = Column(JSON, nullable=True)  # JSON array of break time ranges
    
    # Override settings
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="work_schedule")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
