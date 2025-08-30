from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class ChatPlatform(str, enum.Enum):
    SLACK = "slack"
    GOOGLE_CHAT = "google_chat"
    MICROSOFT_TEAMS = "microsoft_teams"

class ChatIntegration(Base):
    __tablename__ = "chat_integrations"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    platform = Column(String, nullable=False)
    name = Column(String, nullable=False)
    
    # Configuration
    webhook_url = Column(String, nullable=True)
    bot_token = Column(String, nullable=True)
    signing_secret = Column(String, nullable=True)
    app_id = Column(String, nullable=True)
    client_id = Column(String, nullable=True)
    client_secret = Column(String, nullable=True)
    
    # Workspace/Team specific info
    workspace_id = Column(String, nullable=True)
    workspace_name = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Metadata
    config = Column(JSON, nullable=True)  # Platform-specific configuration
    last_sync = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    company = relationship("Company", back_populates="chat_integrations")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
