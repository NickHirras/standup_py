from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.api_v1.api import api_router
from app.core.config import settings
from app.core.database import engine, Base

# Import models in specific order to avoid circular dependencies
from app.models.user import User
from app.models.company import Company
from app.models.team import Team, TeamMember, TeamManager
from app.models.ceremony import Ceremony, CeremonyQuestion
from app.models.response import CeremonyResponse, QuestionResponse, ResponseAttachment
from app.models.question import Question, QuestionOption
from app.models.notification import Notification, NotificationTemplate
from app.models.chat_integration import ChatIntegration
from app.models.work_schedule import WorkSchedule

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StandUp API",
    description="Virtual Daily Stand-up Web Application API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Welcome to StandUp API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
