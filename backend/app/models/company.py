from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    domain = Column(String, unique=True, index=True, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="company")
    teams = relationship("Team", back_populates="company")
    chat_integrations = relationship("ChatIntegration", back_populates="company")
