from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
import json
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.ceremony import Ceremony, CeremonyQuestion
from app.models.response import CeremonyResponse, QuestionResponse, ResponseAttachment
from app.models.team import Team, TeamMember
from app.schemas.response import (
    CeremonyResponseCreate, 
    CeremonyResponseUpdate, 
    CeremonyResponseResponse,
    CeremonyResponseList,
    ResponseSummary,
    QuestionResponseSummary,
    ResponseStatus
)

router = APIRouter()

@router.post("/", response_model=CeremonyResponseResponse)
async def create_ceremony_response(
    response_data: CeremonyResponseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new ceremony response"""
    
    # Verify ceremony exists and is active
    ceremony = db.query(Ceremony).filter(
        Ceremony.id == response_data.ceremony_id,
        Ceremony.is_active == True
    ).first()
    
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found or inactive"
        )
    
    # Verify user is member of the team
    team_member = db.query(TeamMember).filter(
        TeamMember.team_id == response_data.team_id,
        TeamMember.user_id == current_user.id
    ).first()
    
    if not team_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of the specified team"
        )
    
    # Check if user already has a response for this ceremony
    existing_response = db.query(CeremonyResponse).filter(
        CeremonyResponse.ceremony_id == response_data.ceremony_id,
        CeremonyResponse.user_id == current_user.id
    ).first()
    
    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has a response for this ceremony"
        )
    
    # Get ceremony questions to validate responses
    ceremony_questions = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == response_data.ceremony_id
    ).order_by(CeremonyQuestion.order_index).all()
    
    required_questions = [q for q in ceremony_questions if q.is_required]
    
    # Validate that all required questions have responses
    provided_question_ids = {r.question_id for r in response_data.question_responses}
    missing_required = [q.question_id for q in required_questions if q.question_id not in provided_question_ids]
    
    if missing_required:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing responses for required questions: {missing_required}"
        )
    
    # Create the ceremony response
    ceremony_response = CeremonyResponse(
        ceremony_id=response_data.ceremony_id,
        user_id=current_user.id,
        team_id=response_data.team_id,
        notes=response_data.notes,
        mood_rating=response_data.mood_rating,
        energy_level=response_data.energy_level,
        status="submitted",
        is_complete=True,
        completed_at=datetime.utcnow()
    )
    
    db.add(ceremony_response)
    db.flush()  # Get the ID
    
    # Create question responses
    question_responses = []
    for response_item in response_data.question_responses:
        question_response = QuestionResponse(
            ceremony_response_id=ceremony_response.id,
            question_id=response_item.question_id,
            text_response=response_item.text_response,
            selected_options=response_item.selected_options,
            numeric_response=response_item.numeric_response,
            date_response=response_item.date_response,
            time_response=response_item.time_response,
            is_required=next((q.is_required for q in ceremony_questions if q.question_id == response_item.question_id), True)
        )
        question_responses.append(question_response)
    
    db.add_all(question_responses)
    db.commit()
    db.refresh(ceremony_response)
    
    return ceremony_response

@router.get("/ceremony/{ceremony_id}", response_model=List[CeremonyResponseList])
async def get_ceremony_responses(
    ceremony_id: int,
    status: Optional[ResponseStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all responses for a specific ceremony"""
    
    # Verify ceremony exists
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions - user must be team member or admin
    if current_user.role != "admin":
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id,
            TeamMember.team_id == ceremony.team_id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Build query
    query = db.query(CeremonyResponse).filter(
        CeremonyResponse.ceremony_id == ceremony_id
    )
    
    if status:
        query = query.filter(CeremonyResponse.status == status)
    
    responses = query.all()
    
    # Add question response counts
    result = []
    for response in responses:
        response_dict = {
            "id": response.id,
            "ceremony_id": response.ceremony_id,
            "user_id": response.user_id,
            "team_id": response.team_id,
            "submitted_at": response.submitted_at,
            "completed_at": response.completed_at,
            "is_complete": response.is_complete,
            "status": response.status,
            "notes": response.notes,
            "mood_rating": response.mood_rating,
            "energy_level": response.energy_level,
            "question_responses_count": len(response.question_responses)
        }
        result.append(response_dict)
    
    return result

@router.get("/{response_id}", response_model=CeremonyResponseResponse)
async def get_ceremony_response(
    response_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific ceremony response"""
    
    response = db.query(CeremonyResponse).filter(
        CeremonyResponse.id == response_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    # Check permissions
    if current_user.role != "admin" and response.user_id != current_user.id:
        # Check if user is in the same team
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id,
            TeamMember.team_id == response.team_id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return response

@router.put("/{response_id}", response_model=CeremonyResponseResponse)
async def update_ceremony_response(
    response_id: int,
    response_data: CeremonyResponseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a ceremony response"""
    
    response = db.query(CeremonyResponse).filter(
        CeremonyResponse.id == response_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    # Check permissions - only the response owner or admin can update
    if current_user.role != "admin" and response.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Only allow updates if response is in draft or submitted status
    if response.status in ["completed", "archived"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update completed or archived responses"
        )
    
    # Update basic fields
    if response_data.notes is not None:
        response.notes = response_data.notes
    if response_data.mood_rating is not None:
        response.mood_rating = response_data.mood_rating
    if response_data.energy_level is not None:
        response.energy_level = response_data.energy_level
    if response_data.status is not None:
        response.status = response_data.status
    
    # Update question responses if provided
    if response_data.question_responses:
        # Delete existing question responses
        db.query(QuestionResponse).filter(
            QuestionResponse.ceremony_response_id == response_id
        ).delete()
        
        # Create new question responses
        ceremony_questions = db.query(CeremonyQuestion).filter(
            CeremonyQuestion.ceremony_id == response.ceremony_id
        ).all()
        
        question_responses = []
        for response_item in response_data.question_responses:
            question_response = QuestionResponse(
                ceremony_response_id=response_id,
                question_id=response_item.question_id,
                text_response=response_item.text_response,
                selected_options=response_item.selected_options,
                numeric_response=response_item.numeric_response,
                date_response=response_item.date_response,
                time_response=response_item.time_response,
                is_required=next((q.is_required for q in ceremony_questions if q.question_id == response_item.question_id), True)
            )
            question_responses.append(question_response)
        
        db.add_all(question_responses)
    
    # Update completion status
    if response_data.status == "completed":
        response.is_complete = True
        response.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(response)
    
    return response

@router.delete("/{response_id}")
async def delete_ceremony_response(
    response_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a ceremony response"""
    
    response = db.query(CeremonyResponse).filter(
        CeremonyResponse.id == response_id
    ).first()
    
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Response not found"
        )
    
    # Check permissions - only the response owner or admin can delete
    if current_user.role != "admin" and response.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Only allow deletion if response is in draft status
    if response.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete draft responses"
        )
    
    db.delete(response)
    db.commit()
    
    return {"message": "Response deleted successfully"}

@router.get("/ceremony/{ceremony_id}/summary", response_model=ResponseSummary)
async def get_ceremony_response_summary(
    ceremony_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a summary of responses for a specific ceremony"""
    
    # Verify ceremony exists
    ceremony = db.query(Ceremony).filter(Ceremony.id == ceremony_id).first()
    if not ceremony:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ceremony not found"
        )
    
    # Check permissions
    if current_user.role != "admin":
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id,
            TeamMember.team_id == ceremony.team_id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    # Get total team members
    total_team_members = db.query(TeamMember).filter(
        TeamMember.team_id == ceremony.team_id
    ).count()
    
    # Get completed responses
    completed_responses = db.query(CeremonyResponse).filter(
        CeremonyResponse.ceremony_id == ceremony_id,
        CeremonyResponse.status == "completed"
    ).all()
    
    total_responses = len(completed_responses)
    completion_rate = (total_responses / total_team_members * 100) if total_team_members > 0 else 0
    
    # Calculate averages
    mood_ratings = [r.mood_rating for r in completed_responses if r.mood_rating is not None]
    energy_levels = [r.energy_level for r in completed_responses if r.energy_level is not None]
    
    average_mood = sum(mood_ratings) / len(mood_ratings) if mood_ratings else None
    average_energy = sum(energy_levels) / len(energy_levels) if energy_levels else None
    
    # Get question summaries
    ceremony_questions = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.ceremony_id == ceremony_id
    ).order_by(CeremonyQuestion.order_index).all()
    
    question_summaries = []
    for question in ceremony_questions:
        question_responses = db.query(QuestionResponse).join(CeremonyResponse).filter(
            CeremonyResponse.ceremony_id == ceremony_id,
            QuestionResponse.question_id == question.question_id,
            CeremonyResponse.status == "completed"
        ).all()
        
        response_summary = {}
        if question.question_type in ["short_answer", "paragraph"]:
            # Count non-empty text responses
            text_responses = [r.text_response for r in question_responses if r.text_response and r.text_response.strip()]
            response_summary = {
                "total_text_responses": len(text_responses),
                "average_length": sum(len(t) for t in text_responses) / len(text_responses) if text_responses else 0
            }
        
        elif question.question_type in ["multiple_choice", "checkboxes", "dropdown"]:
            # Count option selections
            option_counts = {}
            for response in question_responses:
                if response.selected_options:
                    for option in response.selected_options:
                        option_counts[option] = option_counts.get(option, 0) + 1
            response_summary = {"option_counts": option_counts}
        
        elif question.question_type == "linear_scale":
            # Calculate average and distribution
            numeric_responses = [r.numeric_response for r in question_responses if r.numeric_response is not None]
            if numeric_responses:
                response_summary = {
                    "average": sum(numeric_responses) / len(numeric_responses),
                    "min": min(numeric_responses),
                    "max": max(numeric_responses),
                    "total_responses": len(numeric_responses)
                }
        
        question_completion_rate = (len(question_responses) / total_team_members * 100) if total_team_members > 0 else 0
        
        question_summaries.append({
            "question_id": question.question_id,
            "question_text": question.question.text,
            "question_type": question.question_type,
            "response_summary": response_summary,
            "completion_rate": question_completion_rate
        })
    
    return ResponseSummary(
        ceremony_id=ceremony_id,
        total_responses=total_responses,
        completion_rate=completion_rate,
        average_mood=average_mood,
        average_energy=average_energy,
        question_summaries=question_summaries
    )

@router.get("/user/me", response_model=List[CeremonyResponseList])
async def get_user_responses(
    status: Optional[ResponseStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all responses for the current user"""
    
    query = db.query(CeremonyResponse).filter(
        CeremonyResponse.user_id == current_user.id
    )
    
    if status:
        query = query.filter(CeremonyResponse.status == status)
    
    responses = query.order_by(CeremonyResponse.submitted_at.desc()).all()
    
    # Add question response counts
    result = []
    for response in responses:
        response_dict = {
            "id": response.id,
            "ceremony_id": response.ceremony_id,
            "user_id": response.user_id,
            "team_id": response.team_id,
            "submitted_at": response.submitted_at,
            "completed_at": response.completed_at,
            "is_complete": response.is_complete,
            "status": response.status,
            "notes": response.notes,
            "mood_rating": response.mood_rating,
            "energy_level": response.energy_level,
            "question_responses_count": len(response.question_responses)
        }
        result.append(response_dict)
    
    return result

@router.get("/team/{team_id}", response_model=List[CeremonyResponseList])
async def get_team_responses(
    team_id: int,
    ceremony_id: Optional[int] = None,
    status: Optional[ResponseStatus] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all responses for a specific team"""
    
    # Check if user is member of the team or admin
    if current_user.role != "admin":
        team_member = db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id
        ).first()
        
        if not team_member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    query = db.query(CeremonyResponse).filter(
        CeremonyResponse.team_id == team_id
    )
    
    if ceremony_id:
        query = query.filter(CeremonyResponse.ceremony_id == ceremony_id)
    
    if status:
        query = query.filter(CeremonyResponse.status == status)
    
    responses = query.order_by(CeremonyResponse.submitted_at.desc()).all()
    
    # Add question response counts
    result = []
    for response in responses:
        response_dict = {
            "id": response.id,
            "ceremony_id": response.ceremony_id,
            "user_id": response.user_id,
            "team_id": response.team_id,
            "submitted_at": response.submitted_at,
            "completed_at": response.completed_at,
            "is_complete": response.is_complete,
            "status": response.status,
            "notes": response.notes,
            "mood_rating": response.mood_rating,
            "energy_level": response.energy_level,
            "question_responses_count": len(response.question_responses)
        }
        result.append(response_dict)
    
    return result
