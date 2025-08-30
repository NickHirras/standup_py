from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.auth import get_current_user, get_current_admin_user
from app.core.database import get_db
from app.models.question import Question, QuestionOption
from app.models.user import User
from app.schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionResponse, QuestionListResponse,
    QuestionOptionCreate, QuestionOptionResponse
)

router = APIRouter()

@router.get("/", response_model=List[QuestionListResponse])
async def get_questions(
    skip: int = Query(0, ge=0, description="Number of questions to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of questions to return"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    is_required: Optional[bool] = Query(None, description="Filter by required status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of questions with optional filtering"""
    query = db.query(Question)
    
    if question_type:
        query = query.filter(Question.question_type == question_type)
    if is_required is not None:
        query = query.filter(Question.is_required == is_required)
    
    questions = query.order_by(Question.order_index).offset(skip).limit(limit).all()
    return questions

@router.get("/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get question by ID"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return question

@router.post("/", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new question"""
    # Validate question type
    valid_types = [
        "short_answer", "paragraph", "multiple_choice", "checkboxes",
        "dropdown", "file_upload", "linear_scale", "multiple_choice_grid",
        "checkbox_grid", "date", "time"
    ]
    if question_data.question_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid question type. Must be one of: {', '.join(valid_types)}"
        )
    
    # Validate linear scale questions
    if question_data.question_type == "linear_scale":
        if not question_data.min_value or not question_data.max_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Linear scale questions must have min_value and max_value"
            )
        if question_data.min_value >= question_data.max_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_value must be less than max_value"
            )
    
    # Validate file upload questions
    if question_data.question_type == "file_upload":
        if not question_data.allowed_file_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File upload questions must specify allowed_file_types"
            )
        if not question_data.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File upload questions must specify max_file_size"
            )
    
    # Create new question
    db_question = Question(
        text=question_data.text,
        question_type=question_data.question_type,
        is_required=question_data.is_required,
        order_index=question_data.order_index,
        help_text=question_data.help_text,
        validation_rules=question_data.validation_rules,
        min_value=question_data.min_value,
        max_value=question_data.max_value,
        min_label=question_data.min_label,
        max_label=question_data.max_label,
        allowed_file_types=question_data.allowed_file_types,
        max_file_size=question_data.max_file_size
    )
    
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.put("/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update question information"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update fields
    update_data = question_data.dict(exclude_unset=True)
    
    # Validate question type if being updated
    if "question_type" in update_data:
        valid_types = [
            "short_answer", "paragraph", "multiple_choice", "checkboxes",
            "dropdown", "file_upload", "linear_scale", "multiple_choice_grid",
            "checkbox_grid", "date", "time"
        ]
        if update_data["question_type"] not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid question type. Must be one of: {', '.join(valid_types)}"
            )
    
    # Validate linear scale questions
    if update_data.get("question_type") == "linear_scale" or question.question_type == "linear_scale":
        min_val = update_data.get("min_value", question.min_value)
        max_val = update_data.get("max_value", question.max_value)
        if not min_val or not max_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Linear scale questions must have min_value and max_value"
            )
        if min_val >= max_val:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="min_value must be less than max_value"
            )
    
    # Validate file upload questions
    if update_data.get("question_type") == "file_upload" or question.question_type == "file_upload":
        allowed_types = update_data.get("allowed_file_types", question.allowed_file_types)
        max_size = update_data.get("max_file_size", question.max_file_size)
        if not allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File upload questions must specify allowed_file_types"
            )
        if not max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File upload questions must specify max_file_size"
            )
    
    # Apply updates
    for field, value in update_data.items():
        setattr(question, field, value)
    
    db.commit()
    db.refresh(question)
    
    return question

@router.delete("/{question_id}")
async def delete_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if question is used in any ceremonies
    from app.models.ceremony import CeremonyQuestion
    used_in_ceremonies = db.query(CeremonyQuestion).filter(
        CeremonyQuestion.question_id == question_id
    ).first()
    
    if used_in_ceremonies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete question that is used in ceremonies. Remove it from ceremonies first."
        )
    
    # Delete question options first
    db.query(QuestionOption).filter(QuestionOption.question_id == question_id).delete()
    
    # Delete the question
    db.delete(question)
    db.commit()
    
    return {"message": "Question deleted successfully"}

# Question Options Management
@router.get("/{question_id}/options", response_model=List[QuestionOptionResponse])
async def get_question_options(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get options for a question"""
    # Check if question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    options = db.query(QuestionOption).filter(
        QuestionOption.question_id == question_id
    ).order_by(QuestionOption.order_index).all()
    
    return options

@router.post("/{question_id}/options", response_model=QuestionOptionResponse)
async def add_question_option(
    question_id: int,
    option_data: QuestionOptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an option to a question"""
    # Check if question exists
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Check if question type supports options
    option_types = ["multiple_choice", "checkboxes", "dropdown", "multiple_choice_grid", "checkbox_grid"]
    if question.question_type not in option_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Question type '{question.question_type}' does not support options"
        )
    
    # Check if option value already exists for this question
    existing_option = db.query(QuestionOption).filter(
        QuestionOption.question_id == question_id,
        QuestionOption.value == option_data.value
    ).first()
    if existing_option:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Option value already exists for this question"
        )
    
    # Add option
    question_option = QuestionOption(
        question_id=question_id,
        text=option_data.text,
        value=option_data.value,
        order_index=option_data.order_index,
        is_correct=option_data.is_correct
    )
    
    db.add(question_option)
    db.commit()
    db.refresh(question_option)
    
    return question_option

@router.put("/{question_id}/options/{option_id}")
async def update_question_option(
    question_id: int,
    option_id: int,
    option_data: QuestionOptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a question option"""
    # Check if option exists
    option = db.query(QuestionOption).filter(
        QuestionOption.id == option_id,
        QuestionOption.question_id == question_id
    ).first()
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question option not found"
        )
    
    # Check if new value conflicts with other options
    if option_data.value != option.value:
        existing_option = db.query(QuestionOption).filter(
            QuestionOption.question_id == question_id,
            QuestionOption.value == option_data.value,
            QuestionOption.id != option_id
        ).first()
        if existing_option:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Option value already exists for this question"
            )
    
    # Update fields
    option.text = option_data.text
    option.value = option_data.value
    option.order_index = option_data.order_index
    option.is_correct = option_data.is_correct
    
    db.commit()
    db.refresh(option)
    
    return option

@router.delete("/{question_id}/options/{option_id}")
async def remove_question_option(
    question_id: int,
    option_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an option from a question"""
    option = db.query(QuestionOption).filter(
        QuestionOption.id == option_id,
        QuestionOption.question_id == question_id
    ).first()
    
    if not option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question option not found"
        )
    
    db.delete(option)
    db.commit()
    
    return {"message": "Question option removed successfully"}

# Question Templates
@router.get("/templates", response_model=List[QuestionResponse])
async def get_question_templates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get predefined question templates"""
    # This could return a set of common questions that users can use as starting points
    templates = [
        {
            "text": "What did you work on yesterday?",
            "question_type": "paragraph",
            "is_required": True,
            "help_text": "Describe the main tasks and accomplishments from yesterday"
        },
        {
            "text": "What are you working on today?",
            "question_type": "paragraph",
            "is_required": True,
            "help_text": "List your main priorities and goals for today"
        },
        {
            "text": "Are there any blockers or impediments?",
            "question_type": "paragraph",
            "is_required": False,
            "help_text": "Describe any issues that are preventing you from making progress"
        },
        {
            "text": "How are you feeling today?",
            "question_type": "multiple_choice",
            "is_required": False,
            "help_text": "Select the option that best describes your current mood"
        },
        {
            "text": "What's your energy level?",
            "question_type": "linear_scale",
            "is_required": False,
            "min_value": 1,
            "max_value": 10,
            "min_label": "Exhausted",
            "max_label": "Energized",
            "help_text": "Rate your current energy level"
        }
    ]
    
    return templates
