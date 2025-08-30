from fastapi import APIRouter
from app.api.api_v1.endpoints import auth, users, companies, teams, ceremonies, questions, responses, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(ceremonies.router, prefix="/ceremonies", tags=["ceremonies"])
api_router.include_router(questions.router, prefix="/questions", tags=["questions"])
api_router.include_router(responses.router, prefix="/responses", tags=["responses"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
