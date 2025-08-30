from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, get_current_admin_user
from app.core.database import get_db
from app.models.ceremony import Ceremony, CeremonyQuestion
from app.models.team import Team, TeamMember, TeamManager
from app.models.user import User
from app.schemas.ceremony import (
    CeremonyCreate, CeremonyUpdate, CeremonyResponse, CeremonyListResponse,
    CeremonyQuestionCreate, CeremonyQuestionResponse
)

router = APIRouter()

@router.get("/", response_model=List[CeremonyListResponse])
async def get_ceremonies(
    skip: int = Query(0, ge=0, description="Number of ceremonies to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of ceremonies to return"),
    team_id: Optional[int] = Query(None, description="Filter by team ID"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of ceremonies with optional filtering"""
    query = db.query(Ceremony)
    
    # Non-admin users can only see ceremonies from teams they belong to
    if current_user.role != "admin":
        user_teams = db.query(TeamMember.team_id).filter(TeamMember.user_id == current_user.id).all()
        team_ids = [tm.team_id for tm in user_teams]
        query = query.filter(Ceremony.team_id.in_(team_ids))
    
    if team_id:
        query = query.filter(Ceremony.team_id == team_id)
    if is_active is not None:
        query = query.filter(Ceremony.is_active == is_active)
    
    ceremonies = query.offset(skip).limit(limit).all()
    return ceremonies

@router.get("/{ceremony_id}", response_model=CeremonyResponse)
async def get_ceremony(
    ceremony_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get ceremony by ID"""
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check if user has access to this ceremony's team
    if current_user.role != "admin":
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == ceremony.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this ceremony"
            )
    
    return ceremony

@router.post("/", response_model=CeremonyResponse)
async def create_ceremony(
    ceremony_data: CeremonyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ceremony"""
    # Check if team exists
    team = db.query(Team).filter(Team.id == ceremony_data.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check permissions - only admins or team managers can create ceremonies
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony_data.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to create ceremonies for this team"
            )
    
    # Check if ceremony name already exists in the team
    existing_ceremony = db.query(Ceremony).filter(
        Ceremony.name == ceremony_data.name,
        Ceremony.team_id == ceremony_data.team_id
    ).first()
    if existing_ceremony:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ceremony name already exists in this team"
        )
    
    # Create new ceremony
    db_ceremony = Ceremony(
        name=ceremony_data.name,
        description=ceremony_data.description,
        team_id=ceremony_data.team_id,
        cadence=ceremony_data.cadence,
        start_time=ceremony_data.start_time,
        timezone=ceremony_data.timezone,
        send_notifications=ceremony_data.send_notifications,
        notification_lead_time=ceremony_data.notification_lead_time,
        chat_notifications_enabled=ceremony_data.chat_notifications_enabled,
        chat_webhook_url=ceremony_data.chat_webhook_url,
        is_active=True,
        status="active"
    )
    
    db.add(db_ceremony)
    db.commit()
    db.refresh(db_ceremony)
    
    return db_ceremony

@router.put("/{ceremony_id}", response_model=CeremonyResponse)
async def update_ceremony(
    ceremony_id: int,
    ceremony_data: CeremonyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update ceremony information"""
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can update
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update this ceremony"
            )
    
    # Update fields
    update_data = ceremony_data.dict(exclude_unset=True)
    
    # Check for name conflicts if name is being updated
    if "name" in update_data and update_data["name"] != ceremony.name:
        existing_ceremony = db.query(Ceremony).filter(
            Ceremony.name == update_data["name"],
            Ceremony.team_id == ceremony.team_id,
            Ceremony.id != ceremony_id
        ).first()
        if existing_ceremony:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ceremony name already exists in this team"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(ceremony, field, value)
    
    db.commit()
    db.refresh(ceremony)
    
    return ceremony

@router.delete("/{ceremony_id}")
async def delete_ceremony(
    ceremony_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a ceremony"""
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can delete
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to delete this ceremony"
            )
    
    # Delete ceremony questions first
    db.query(CeremonyQuestion).filter(CeremonyQuestion.ceremony_id == ceremony_id).delete()
    
    # Delete the ceremony
    db.delete(ceremony)
    db.commit()
    
    return {"message": "Ceremony deleted successfully"}

@router.patch("/{ceremony_id}/activate")
async def activate_ceremony(
    ceremony_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate/deactivate a ceremony"""
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can activate/deactivate
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    ceremony.is_active = not ceremony.is_active
    db.commit()
    
    status_text = "activated" if ceremony.is_active else "deactivated"
    return {"message": f"Ceremony {status_text} successfully"}

@router.patch("/{ceremony_id}/status")
async def update_ceremony_status(
    ceremony_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update ceremony status"""
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can update status
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    # Validate status
    valid_statuses = ["active", "paused", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    ceremony.status = status
    db.commit()
    
    return {"message": f"Ceremony status updated to {status}"}

# Ceremony Questions Management
@router.get("/{ceremony_id}/questions", response_model=List[CeremonyQuestionResponse])
async def get_ceremony_questions(
    ceremony_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions for a ceremony"""
    # Check if ceremony exists
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check if user has access to this ceremony's team
    if current_user.role != "admin":
        is_member = db.query(TeamMember).filter(
            TeamMember.team_id == ceremony.team_id,
            TeamMember.user_id == current_user.id
        ).first()
        if not is_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to access this ceremony"
            )
    
    questions = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == ceremony_id
    ).order_by(CeremonyQuestion.order_index).all()
    
    return questions

@router.post("/{ceremony_id}/questions", response_model=CeremonyQuestionResponse)
async def add_ceremony_question(
    ceremony_id: int,
    question_data: CeremonyQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a question to a ceremony"""
    # Check if ceremony exists
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can add questions
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    # Check if question exists
    from app.models.question import Question
    question = db.query(Question).filter(Question.id == question_data.question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if question is already in this ceremony
    existing_question = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == ceremony_id,
        CeremonyQuestion.question_id == question_data.question_id
    ).first()
    if existing_question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is already in this ceremony"
        )
    
    # Add question to ceremony
    ceremony_question = CeremonyQuestion(
        ceremony_id=ceremony_id,
        question_id=question_data.question_id,
        order_index=question_data.order_index,
        is_required=question_data.is_required
    )
    
    db.add(ceremony_question)
    db.commit()
    db.refresh(ceremony_question)
    
    return ceremony_question

@router.put("/{ceremony_id}/questions/{question_id}")
async def update_ceremony_question(
    ceremony_id: int,
    question_id: int,
    question_data: CeremonyQuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a ceremony question"""
    # Check if ceremony question exists
    ceremony_question = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == ceremony_id,
        CeremonyQuestion.question_id == question_id
    ).first()
    if not ceremony_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony question not found"
        )
    
    # Check permissions - only admins or team managers can update
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    # Update fields
    ceremony_question.order_index = question_data.order_index
    ceremony_question.is_required = question_data.is_required
    
    db.commit()
    db.refresh(ceremony_question)
    
    return ceremony_question

@router.delete("/{ceremony_id}/questions/{question_id}")
async def remove_ceremony_question(
    ceremony_id: int,
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a question from a ceremony"""
    # Check if ceremony question exists
    ceremony_question = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == ceremony_id,
        CeremonyQuestion.question_id == question_id
    ).first()
    if not ceremony_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony question not found"
        )
    
    # Check permissions - only admins or team managers can remove
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    db.delete(ceremony_question)
    db.commit()
    
    return {"message": "Question removed from ceremony successfully"}

@router.patch("/{ceremony_id}/questions/reorder")
async def reorder_ceremony_questions(
    ceremony_id: int,
    question_orders: List[dict],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reorder questions in a ceremony"""
    # Check if ceremony exists
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - only admins or team managers can reorder
    if current_user.role != "admin":
        is_manager = db.query(TeamManager).filter(
            TeamManager.team_id == ceremony.team_id,
            TeamManager.user_id == current_user.id
        ).first()
        if not is_manager:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage this ceremony"
            )
    
    # Validate input format
    if not question_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question orders list cannot be empty"
        )
    
    # Update question orders
    for order_item in question_orders:
        question_id = order_item.get("question_id")
        new_order = order_item.get("order_index")
        
        if question_id is None or new_order is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Each order item must have question_id and order_index"
            )
        
        # Find and update the ceremony question
        ceremony_question = db.query(CeremonyQuestion).filter(
            CeremonyQuestion.ceremony_id == ceremony_id,
            CeremonyQuestion.question_id == question_id
        ).first()
        
        if ceremony_question:
            ceremony_question.order_index = new_order
    
    db.commit()
    
    return {"message": "Questions reordered successfully"}
