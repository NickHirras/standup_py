from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, LoginRequest

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    Logout endpoint. In a production environment, you might want to:
    1. Add the token to a blacklist
    2. Store logout timestamp
    3. Implement token revocation
    """
    # For now, we'll just return success since JWT tokens are stateless
    # The client is responsible for removing the token from storage
    return {"message": "Successfully logged out"}

@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user)
):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=current_user.email, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role
    }

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "company_id": current_user.company_id,
        "timezone": current_user.timezone
    }
