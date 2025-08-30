from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, get_current_admin_user
from app.core.database import get_db
from app.models.team import Team, TeamMember, TeamManager
from app.models.user import User
from app.schemas.team import (
    TeamCreate, TeamUpdate, TeamResponse, TeamListResponse,
    TeamMemberCreate, TeamMemberResponse, TeamManagerCreate, TeamManagerResponse
)

router = APIRouter()

@router.get("/", response_model=List[TeamListResponse])
async def get_teams(
    skip: int = Query(0, ge=0, description="Number of teams to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of teams to return"),
    company_id: Optional[int] = Query(None, description="Filter by company ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of teams with optional filtering"""
    query = db.query(Team)
    
    # Non-admin users can only see teams they belong to
    if current_user.role != "admin":
        user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
        team_ids = [tm.team_id for tm in user_teams]
        query = query.filter(Team.id.in_(team_ids))
    
    if company_id:
        query = query.filter(Team.company_id == company_id)
    if is_active is not None:
        query = query.filter(Team.is_active == is_active)
    
    teams = query.offset(skip).limit(limit).all()
    return teams

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team by ID"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user has access to this team
    if current_user.role != "admin":
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this team"
            )
    
    return team

@router.post("/", response_model=TeamResponse)
async def create_team(
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

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    team_data: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update team information"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions - only admins or team managers can update
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this team"
            )
    
    # Update fields
    update_data = team_data.dict(exclude_unset=True)
    
    # Check for name conflicts if name is being updated
    if "name" in update_data and update_data["name"] != team.name:
        existing_team = db.query(Team).filter(
            Team.name == update_data["name"],
            Team.company_id == team.company_id,
            Team.id != team_id
        ).first()
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already exists in this company"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(team, field, value)
    
    db.commit()
    db.refresh(team)
    
    return team

@router.delete("/{team_id}")
async def delete_team(
    team_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a team (admin only)"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Delete team members and managers first
    db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
    db.query(TeamManager).filter(TeamManager.team_id == team_id).delete()
    
    # Delete the team
    db.delete(team)
    db.commit()
    
    return {"message": "Team deleted successfully"}

@router.patch("/{team_id}/activate")
async def activate_team(
    team_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Activate/deactivate a team (admin only)"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team.is_active = not team.is_active
    db.commit()
    
    status_text = "activated" if team.is_active else "deactivated"
    return {"message": f"Team {status_text} successfully"}

# Team Members Management
@router.get("/{team_id}/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team members"""
    # Check if user has access to this team
    if current_user.role != "admin":
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this team"
            )
    
    members = db.query(TeamMember).filter(TeamMember.team_id == team_id).all()
    return members

@router.post("/{team_id}/members", response_model=TeamMemberResponse)
async def add_team_member(
    team_id: int,
    member_data: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a member to a team"""
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions - only admins or team managers can add members
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this team"
            )
    
    # Check if user exists
    user = db.query(User).filter(User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a member
    existing_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == member_data.user_id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this team"
        )
    
    # Add member
    team_member = TeamMember(
        team_id=team_id,
        user_id=member_data.user_id
    )
    
    db.add(team_member)
    db.commit()
    db.refresh(team_member)
    
    return team_member

@router.delete("/{team_id}/members/{user_id}")
async def remove_team_member(
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a member from a team"""
    # Check permissions - only admins or team managers can remove members
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this team"
            )
    
    # Remove member
    member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    db.delete(member)
    db.commit()
    
    return {"message": "Team member removed successfully"}

# Team Managers Management
@router.get("/{team_id}/managers", response_model=List[TeamManagerResponse])
async def get_team_managers(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team managers"""
    # Check if user has access to this team
    if current_user.role != "admin":
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this team"
            )
    
    managers = db.query(TeamManager).filter(TeamManager.team_id == team_id).all()
    return managers

@router.post("/{team_id}/managers", response_model=TeamManagerResponse)
async def add_team_manager(
    team_id: int,
    manager_data: TeamManagerCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Add a manager to a team (admin only)"""
    # Check if team exists
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.id == manager_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already a manager
    existing_manager = db.query(TeamManager).filter(
        TeamManager.team_id == team_id,
        TeamManager.user_id == manager_data.user_id
    ).first()
    if existing_manager:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a manager of this team"
        )
    
    # Ensure user is a team member first
    is_member = db.query(TeamMember).filter(
        TeamMember.team_id == team_id,
        TeamMember.user_id == manager_data.user_id
    ).first()
    if not is_member:
        # Add user as member first
        team_member = TeamMember(team_id=team_id, user_id=manager_data.user_id)
        db.add(team_member)
    
    # Add manager
    team_manager = TeamManager(
        team_id=team_id,
        user_id=manager_data.user_id,
        permissions=manager_data.permissions or "full"
    )
    
    db.add(team_manager)
    db.commit()
    db.refresh(team_manager)
    
    return team_manager

@router.delete("/{team_id}/managers/{user_id}")
async def remove_team_manager(
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Remove a manager from a team (admin only)"""
    manager = db.query(TeamManager).filter(
        TeamManager.team_id == team_id,
        TeamManager.user_id == user_id
    ).first()
    
    if not manager:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team manager not found"
        )
    
    db.delete(manager)
    db.commit()
    
    return {"message": "Team manager removed successfully"}
