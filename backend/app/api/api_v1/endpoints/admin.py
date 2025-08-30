from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.core.auth import get_current_admin_user
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.team import Team, TeamMember, TeamManager
from app.models.ceremony import Ceremony
from app.models.response import CeremonyResponse
from app.models.question import Question
from app.models.chat_integration import ChatIntegration
from app.models.work_schedule import WorkSchedule
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse, TeamListResponse
from app.schemas.admin import (
    AdminDashboardStats, UserManagementResponse, CompanyManagementResponse,
    TeamManagementResponse, IntegrationManagementResponse, SystemHealthResponse
)

router = APIRouter()

# ============================================================================
# ADMIN DASHBOARD & OVERVIEW
# ============================================================================

@router.get("/dashboard", response_model=AdminDashboardStats)
async def get_admin_dashboard(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics and overview"""
    
    # User statistics
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar()
    admin_users = db.query(func.count(User.id)).filter(User.role == UserRole.ADMIN).scalar()
    
    # Company statistics
    total_companies = db.query(func.count(Company.id)).scalar()
    active_companies = db.query(func.count(Company.id)).filter(Company.is_active == True).scalar()
    
    # Team statistics
    total_teams = db.query(func.count(Team.id)).scalar()
    active_teams = db.query(func.count(Team.id)).filter(Team.is_active == True).scalar()
    
    # Ceremony statistics
    total_ceremonies = db.query(func.count(Ceremony.id)).scalar()
    active_ceremonies = db.query(func.count(Ceremony.id)).filter(Ceremony.is_active == True).scalar()
    
    # Response statistics
    total_responses = db.query(func.count(CeremonyResponse.id)).scalar()
    completed_responses = db.query(func.count(CeremonyResponse.id)).filter(CeremonyResponse.status == "completed").scalar()
    
    # Question statistics
    total_questions = db.query(func.count(Question.id)).scalar()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    recent_users = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()
    recent_responses = db.query(func.count(CeremonyResponse.id)).filter(CeremonyResponse.submitted_at >= week_ago).scalar()
    
    return AdminDashboardStats(
        users={
            "total": total_users,
            "active": active_users,
            "verified": verified_users,
            "admins": admin_users,
            "recent": recent_users
        },
        companies={
            "total": total_companies,
            "active": active_companies
        },
        teams={
            "total": total_teams,
            "active": active_teams
        },
        ceremonies={
            "total": total_ceremonies,
            "active": active_ceremonies
        },
        responses={
            "total": total_responses,
            "active": completed_responses,  # Using completed responses as "active"
            "recent": recent_responses
        },
        questions={
            "total": total_questions,
            "active": total_questions,  # All questions are considered "active" for now
            "recent": 0  # No recent questions tracking yet
        }
    )

# ============================================================================
# USER MANAGEMENT
# ============================================================================

@router.get("/users", response_model=UserManagementResponse)
async def get_users_management(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of users to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    role: Optional[str] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    search: Optional[str] = Query(None, description="Search by name, email, or username"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get users for admin management with advanced filtering"""
    
    query = db.query(User)
    
    # Apply filters
    if company_id:
        query = query.filter(User.company_id == company_id)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if is_verified is not None:
        query = query.filter(User.is_verified == is_verified)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (User.username.ilike(search_filter))
        )
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    return UserManagementResponse(
        users=users,
        total_count=total_count,
        skip=skip,
        limit=limit
    )

@router.post("/users", response_model=UserResponse)
async def create_user_admin(
    user_data: UserCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new user (admin only)"""
    
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if user_data.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        company_id=user_data.company_id,
        timezone=user_data.timezone or "UTC",
        is_active=True,
        is_verified=True  # Admin-created users are verified by default
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if email already exists (if changing email)
    if user_data.email and user_data.email != user.email:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if username already exists (if changing username)
    if user_data.username and user_data.username != user.username:
        existing_username = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "password" and value:
            setattr(user, "hashed_password", get_password_hash(value))
        elif field != "password":
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete - mark as inactive instead of hard delete
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.post("/users/{user_id}/activate")
async def activate_user_admin(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Activate a deactivated user (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}

# ============================================================================
# COMPANY MANAGEMENT
# ============================================================================

@router.get("/companies", response_model=CompanyManagementResponse)
async def get_companies_management(
    skip: int = Query(0, ge=0, description="Number of companies to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of companies to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or domain"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get companies for admin management"""
    
    query = db.query(Company)
    
    # Apply filters
    if is_active is not None:
        query = query.filter(Company.is_active == is_active)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Company.name.ilike(search_filter)) |
            (Company.domain.ilike(search_filter))
        )
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    companies = query.order_by(desc(Company.created_at)).offset(skip).limit(limit).all()
    
    return CompanyManagementResponse(
        companies=companies,
        total_count=total_count,
        skip=skip,
        limit=limit
    )

@router.post("/companies", response_model=CompanyResponse)
async def create_company_admin(
    company_data: CompanyCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new company (admin only)"""
    
    # Check if company name already exists
    existing_company = db.query(Company).filter(Company.name == company_data.name).first()
    if existing_company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name already exists"
        )
    
    # Check if domain already exists
    if company_data.domain:
        existing_domain = db.query(Company).filter(Company.domain == company_data.domain).first()
        if existing_domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company domain already exists"
            )
    
    # Create new company
    db_company = Company(
        name=company_data.name,
        domain=company_data.domain,
        description=company_data.description,
        logo_url=company_data.logo_url,
        website=company_data.website,
        address=company_data.address,
        phone=company_data.phone,
        is_active=True
    )
    
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    return db_company

@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company_admin(
    company_id: int,
    company_data: CompanyUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update company (admin only)"""
    
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if company name already exists (if changing name)
    if company_data.name and company_data.name != company.name:
        existing_company = db.query(Company).filter(Company.name == company_data.name).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company name already exists"
            )
    
    # Check if domain already exists (if changing domain)
    if company_data.domain and company_data.domain != company.domain:
        existing_domain = db.query(Company).filter(Company.domain == company_data.domain).first()
        if existing_domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company domain already exists"
            )
    
    # Update company fields
    update_data = company_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return company

@router.delete("/companies/{company_id}")
async def delete_company_admin(
    company_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete company (admin only)"""
    
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if company has active users
    active_users = db.query(func.count(User.id)).filter(
        User.company_id == company_id,
        User.is_active == True
    ).scalar()
    
    if active_users > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete company with active users"
        )
    
    # Soft delete - mark as inactive
    company.is_active = False
    db.commit()
    
    return {"message": "Company deactivated successfully"}

# ============================================================================
# TEAM MANAGEMENT
# ============================================================================

@router.get("/teams", response_model=TeamManagementResponse)
async def get_teams_management(
    skip: int = Query(0, ge=0, description="Number of teams to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of teams to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by team name"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get teams for admin management"""
    
    query = db.query(Team)
    
    # Apply filters
    if company_id:
        query = query.filter(Team.company_id == company_id)
    if is_active is not None:
        query = query.filter(Team.is_active == is_active)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(Team.name.ilike(search_filter))
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    teams = query.order_by(desc(Team.created_at)).offset(skip).limit(limit).all()
    
    return TeamManagementResponse(
        teams=teams,
        total_count=total_count,
        skip=skip,
        limit=limit
    )

@router.post("/teams", response_model=TeamResponse)
async def create_team_admin(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new team (admin only)"""
    
    # Check if team name already exists in the company
    existing_team = db.query(Team).filter(
        Team.name == team_data.name,
        Team.company_id == team_data.company_id
    ).first()
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already exists in this company"
        )
    
    # Create new team
    db_team = Team(
        name=team_data.name,
        description=team_data.description,
        company_id=team_data.company_id,
        is_active=True
    )
    
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    
    return db_team

@router.put("/teams/{team_id}", response_model=TeamResponse)
async def update_team_admin(
    team_id: int,
    team_data: TeamUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update team (admin only)"""
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if team name already exists in the company (if changing name)
    if team_data.name and team_data.name != team.name:
        existing_team = db.query(Team).filter(
            Team.name == team_data.name,
            Team.company_id == team.company_id
        ).first()
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already exists in this company"
            )
    
    # Update team fields
    update_data = team_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)
    
    db.commit()
    db.refresh(team)
    
    return team

@router.delete("/teams/{team_id}")
async def delete_team_admin(
    team_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete team (admin only)"""
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if team has active members
    active_members = db.query(func.count(TeamMember.id)).filter(
        TeamMember.team_id == team_id,
        TeamMember.is_active == True
    ).scalar()
    
    if active_members > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete team with active members"
        )
    
    # Soft delete - mark as inactive
    team.is_active = False
    db.commit()
    
    return {"message": "Team deactivated successfully"}

# ============================================================================
# INTEGRATION MANAGEMENT
# ============================================================================

@router.get("/integrations", response_model=IntegrationManagementResponse)
async def get_integrations_management(
    skip: int = Query(0, ge=0, description="Number of integrations to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of integrations to return"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get integrations for admin management"""
    
    query = db.query(ChatIntegration)
    
    # Apply filters
    if platform:
        query = query.filter(ChatIntegration.platform == platform)
    if is_active is not None:
        query = query.filter(ChatIntegration.is_active == is_active)
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination and ordering
    integrations = query.order_by(desc(ChatIntegration.created_at)).offset(skip).limit(limit).all()
    
    return IntegrationManagementResponse(
        integrations=integrations,
        total_count=total_count,
        skip=skip,
        limit=limit
    )

@router.post("/integrations")
async def create_integration_admin(
    integration_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new integration (admin only)"""
    
    # Create new integration
    db_integration = ChatIntegration(
        name=integration_data.get("name"),
        platform=integration_data.get("platform"),
        company_id=integration_data.get("company_id"),
        webhook_url=integration_data.get("webhook_url"),
        bot_token=integration_data.get("bot_token"),
        signing_secret=integration_data.get("signing_secret"),
        app_id=integration_data.get("app_id"),
        client_id=integration_data.get("client_id"),
        client_secret=integration_data.get("client_secret"),
        workspace_id=integration_data.get("workspace_id"),
        workspace_name=integration_data.get("workspace_name"),
        is_active=True
    )
    
    db.add(db_integration)
    db.commit()
    db.refresh(db_integration)
    
    return db_integration

@router.put("/integrations/{integration_id}")
async def update_integration_admin(
    integration_id: int,
    integration_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update integration (admin only)"""
    
    integration = db.query(ChatIntegration).filter(ChatIntegration.id == integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    # Update integration fields
    for field, value in integration_data.items():
        if hasattr(integration, field):
            setattr(integration, field, value)
    
    db.commit()
    db.refresh(integration)
    
    return integration

@router.delete("/integrations/{integration_id}")
async def delete_integration_admin(
    integration_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete integration (admin only)"""
    
    integration = db.query(ChatIntegration).filter(ChatIntegration.id == integration_id).first()
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    # Soft delete - mark as inactive
    integration.is_active = False
    db.commit()
    
    return {"message": "Integration deactivated successfully"}

# ============================================================================
# SYSTEM HEALTH & MAINTENANCE
# ============================================================================

@router.get("/system/health", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system health information"""
    
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Get system statistics
    total_users = db.query(func.count(User.id)).scalar()
    total_companies = db.query(func.count(Company.id)).scalar()
    total_teams = db.query(func.count(Team.id)).scalar()
    total_ceremonies = db.query(func.count(Ceremony.id)).scalar()
    
    # Check for potential issues
    issues = []
    
    # Check for users without companies
    orphaned_users = db.query(func.count(User.id)).filter(User.company_id.is_(None)).scalar()
    if orphaned_users > 0:
        issues.append(f"{orphaned_users} users without company assignment")
    
    # Check for teams without companies
    orphaned_teams = db.query(func.count(Team.id)).filter(Team.company_id.is_(None)).scalar()
    if orphaned_teams > 0:
        issues.append(f"{orphaned_teams} teams without company assignment")
    
    # Check for inactive users
    inactive_users = db.query(func.count(User.id)).filter(User.is_active == False).scalar()
    if inactive_users > 0:
        issues.append(f"{inactive_users} inactive users")
    
    return SystemHealthResponse(
        database_status=db_status,
        total_users=total_users,
        total_companies=total_companies,
        total_teams=total_teams,
        total_ceremonies=total_ceremonies,
        issues=issues,
        timestamp=datetime.utcnow()
    )

@router.post("/system/maintenance/cleanup")
async def run_system_cleanup(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Run system cleanup tasks (admin only)"""
    
    # This is a placeholder for actual cleanup tasks
    # In a real implementation, you might:
    # - Clean up old log files
    # - Archive old data
    # - Optimize database tables
    # - Clean up temporary files
    
    return {"message": "System cleanup completed successfully"}
