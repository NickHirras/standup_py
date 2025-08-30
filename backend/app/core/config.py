from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "StandUp"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[Union[str, AnyHttpUrl]] = [
        "http://localhost:4200",  # Angular dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:4200",  # Alternative localhost format
        "http://127.0.0.1:3000",  # Alternative localhost format
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "sqlite:///./data/standup.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "StandUp"
    
    # Chat Integration
    SLACK_BOT_TOKEN: str = ""
    SLACK_SIGNING_SECRET: str = ""
    GOOGLE_CHAT_WEBHOOK_URL: str = ""
    MICROSOFT_TEAMS_WEBHOOK_URL: str = ""
    
    # Redis (for Celery)
    REDIS_URL: str = "redis://localhost:6379"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Timezone
    DEFAULT_TIMEZONE: str = "UTC"
    
    # Work Hours
    DEFAULT_WORK_START_HOUR: int = 9
    DEFAULT_WORK_END_HOUR: int = 17
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
