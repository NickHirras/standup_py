from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, get_current_admin_user
from app.core.database import get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse

router = APIRouter()

@router.get("/", response_model=List[CompanyListResponse])
async def get_companies(
    skip: int = Query(0, ge=0, description="Number of companies to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of companies to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get list of companies (admin only)"""
    query = db.query(Company)
    
    if is_active is not None:
        query = query.filter(Company.is_active == is_active)
    
    companies = query.offset(skip).limit(limit).all()
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company by ID"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Users can only access their own company unless they're admin
    if current_user.role != "admin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this company"
        )
    
    return company

@router.post("/", response_model=CompanyResponse)
async def create_company(
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

@router.put("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_data: CompanyUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update company information (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Update fields
    update_data = company_data.dict(exclude_unset=True)
    
    # Check for name conflicts if name is being updated
    if "name" in update_data and update_data["name"] != company.name:
        existing_company = db.query(Company).filter(
            Company.name == update_data["name"],
            Company.id != company_id
        ).first()
        if existing_company:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company name already exists"
            )
    
    # Check for domain conflicts if domain is being updated
    if "domain" in update_data and update_data["domain"] != company.domain:
        if update_data["domain"]:
            existing_domain = db.query(Company).filter(
                Company.domain == update_data["domain"],
                Company.id != company_id
            ).first()
            if existing_domain:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Company domain already exists"
                )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return company

@router.delete("/{company_id}")
async def delete_company(
    company_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Check if company has users
    users_count = db.query(User).filter(User.company_id == company_id).count()
    if users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete company with {users_count} users. Remove all users first."
        )
    
    # Check if company has teams
    from app.models.team import Team
    teams_count = db.query(Team).filter(Team.company_id == company_id).count()
    if teams_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete company with {teams_count} teams. Remove all teams first."
        )
    
    # Delete the company
    db.delete(company)
    db.commit()
    
    return {"message": "Company deleted successfully"}

@router.patch("/{company_id}/activate")
async def activate_company(
    company_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Activate/deactivate a company (admin only)"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    company.is_active = not company.is_active
    db.commit()
    
    status_text = "activated" if company.is_active else "deactivated"
    return {"message": f"Company {status_text} successfully"}

@router.get("/{company_id}/stats")
async def get_company_stats(
    company_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get company statistics"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Users can only access their own company unless they're admin
    if current_user.role != "admin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this company"
        )
    
    # Get statistics
    users_count = db.query(User).filter(User.company_id == company_id).count()
    active_users_count = db.query(User).filter(
        User.company_id == company_id,
        User.is_active == True
    ).count()
    
    from app.models.team import Team
    teams_count = db.query(Team).filter(Team.company_id == company_id).count()
    active_teams_count = db.query(Team).filter(
        Team.company_id == company_id,
        Team.is_active == True
    ).count()
    
    from app.models.ceremony import Ceremony
    ceremonies_count = db.query(Ceremony).join(Team).filter(Team.company_id == company_id).count()
    active_ceremonies_count = db.query(Ceremony).join(Team).filter(
        Team.company_id == company_id,
        Ceremony.is_active == True
    ).count()
    
    return {
        "company_id": company_id,
        "company_name": company.name,
        "users": {
            "total": users_count,
            "active": active_users_count,
            "inactive": users_count - active_users_count
        },
        "teams": {
            "total": teams_count,
            "active": active_teams_count,
            "inactive": teams_count - active_teams_count
        },
        "ceremonies": {
            "total": ceremonies_count,
            "active": active_ceremonies_count,
            "inactive": ceremonies_count - active_ceremonies_count
        }
    }

@router.get("/{company_id}/users", response_model=List[dict])
async def get_company_users(
    company_id: int,
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of users to return"),
    role: Optional[str] = Query(None, description="Filter by user role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Users can only access their own company unless they're admin
    if current_user.role != "admin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this company"
        )
    
    query = db.query(User).filter(User.company_id == company_id)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    
    # Return simplified user data
    return [
        {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "timezone": user.timezone,
            "created_at": user.created_at
        }
        for user in users
    ]

@router.get("/{company_id}/teams", response_model=List[dict])
async def get_company_teams(
    company_id: int,
    skip: int = Query(0, ge=0, description="Number of teams to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of teams to return"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get teams for a company"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )
    
    # Users can only access their own company unless they're admin
    if current_user.role != "admin" and current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to access this company"
        )
    
    from app.models.team import Team, TeamMember
    query = db.query(Team).filter(Team.company_id == company_id)
    
    if is_active is not None:
        query = query.filter(Team.is_active == is_active)
    
    teams = query.offset(skip).limit(limit).all()
    
    # Get member counts for each team
    result = []
    for team in teams:
        member_count = db.query(TeamMember).filter(TeamMember.team_id == team.id).count()
        result.append({
            "id": team.id,
            "name": team.name,
            "description": team.description,
            "is_active": team.is_active,
            "member_count": member_count,
            "created_at": team.created_at
        })
    
    return result
