#!/usr/bin/env python3
"""
Database seeder for StandUp application
Creates sample companies, users, teams, and ceremonies for testing
"""

import os
import sys
from datetime import datetime, time, timedelta
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def seed_database():
    try:
        print("🌱 Seeding database with sample data...")
        
        # Import after setting up the path
        from app.core.database import SessionLocal, Base, engine
        from app.core.security import get_password_hash
        from app.models import User, Company, Team, TeamMember, TeamManager, Ceremony, Question, CeremonyQuestion
        
        # Create database session
        db = SessionLocal()
        
        # Create sample company
        print("🏢 Creating sample company...")
        company = Company(
            name="Acme Software Corp",
            domain="acme.com",
            description="A leading software development company",
            website="https://acme.com",
            address="123 Tech Street, Silicon Valley, CA",
            phone="+1-555-0123",
            is_active=True
        )
        db.add(company)
        db.flush()  # Get the ID without committing
        
        # Create sample users
        print("👥 Creating sample users...")
        
        # Admin user
        admin_user = User(
            email="admin@acme.com",
            username="admin",
            full_name="System Administrator",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True,
            is_verified=True,
            company_id=company.id,
            timezone="America/Los_Angeles"
        )
        db.add(admin_user)
        
        # Team Manager
        manager_user = User(
            email="sarah.manager@acme.com",
            username="sarah",
            full_name="Sarah Johnson",
            hashed_password=get_password_hash("manager123"),
            role="user",
            is_active=True,
            is_verified=True,
            company_id=company.id,
            timezone="America/Los_Angeles"
        )
        db.add(manager_user)
        
        # Team Members
        member1 = User(
            email="john.dev@acme.com",
            username="john",
            full_name="John Developer",
            hashed_password=get_password_hash("dev123"),
            role="user",
            is_active=True,
            is_verified=True,
            company_id=company.id,
            timezone="America/Los_Angeles"
        )
        db.add(member1)
        
        member2 = User(
            email="jane.qa@acme.com",
            username="jane",
            full_name="Jane Tester",
            hashed_password=get_password_hash("qa123"),
            role="user",
            is_active=True,
            is_verified=True,
            company_id=company.id,
            timezone="America/Los_Angeles"
        )
        db.add(member2)
        
        member3 = User(
            email="bob.design@acme.com",
            username="bob",
            full_name="Bob Designer",
            hashed_password=get_password_hash("design123"),
            role="user",
            is_active=True,
            is_verified=True,
            company_id=company.id,
            timezone="America/Los_Angeles"
        )
        db.add(member3)
        
        db.flush()  # Get all user IDs
        
        # Create sample team
        print("👨‍💼 Creating sample team...")
        team = Team(
            name="Product Development Team",
            description="Core team responsible for product development and delivery",
            company_id=company.id,
            is_active=True
        )
        db.add(team)
        db.flush()
        
        # Add team members
        print("🔗 Adding team members...")
        team_members = [
            TeamMember(team_id=team.id, user_id=manager_user.id),
            TeamMember(team_id=team.id, user_id=member1.id),
            TeamMember(team_id=team.id, user_id=member2.id),
            TeamMember(team_id=team.id, user_id=member3.id)
        ]
        for member in team_members:
            db.add(member)
        
        # Add team manager
        team_manager = TeamManager(
            team_id=team.id,
            user_id=manager_user.id,
            permissions="full"
        )
        db.add(team_manager)
        
        # Create sample questions
        print("❓ Creating sample questions...")
        questions = [
            Question(
                text="What did you work on yesterday?",
                question_type="paragraph",
                is_required=True,
                order_index=1,
                help_text="Describe the main tasks and accomplishments from yesterday"
            ),
            Question(
                text="What are you working on today?",
                question_type="paragraph",
                is_required=True,
                order_index=2,
                help_text="List your main priorities and goals for today"
            ),
            Question(
                text="Are there any blockers or impediments?",
                question_type="paragraph",
                is_required=False,
                order_index=3,
                help_text="Describe any issues that are preventing you from making progress"
            ),
            Question(
                text="How are you feeling today?",
                question_type="multiple_choice",
                is_required=False,
                order_index=4,
                help_text="Select the option that best describes your current mood"
            ),
            Question(
                text="What's your energy level?",
                question_type="linear_scale",
                is_required=False,
                order_index=5,
                min_value=1,
                max_value=10,
                min_label="Exhausted",
                max_label="Energized"
            ),
            Question(
                text="Which project are you currently working on?",
                question_type="dropdown",
                is_required=True,
                order_index=6,
                help_text="Select the main project you're contributing to"
            ),
            Question(
                text="What's your confidence level in completing today's tasks?",
                question_type="linear_scale",
                is_required=False,
                order_index=7,
                min_value=1,
                max_value=5,
                min_label="Not confident",
                max_label="Very confident"
            ),
            Question(
                text="Do you need help with anything?",
                question_type="checkboxes",
                is_required=False,
                order_index=8,
                help_text="Check all that apply"
            ),
            Question(
                text="What's your estimated completion time for today's main task?",
                question_type="time",
                is_required=False,
                order_index=9,
                help_text="When do you expect to finish your primary task?"
            ),
            Question(
                text="Rate your team collaboration experience today",
                question_type="linear_scale",
                is_required=False,
                order_index=10,
                min_value=1,
                max_value=10,
                min_label="Poor",
                max_label="Excellent"
            )
        ]
        for question in questions:
            db.add(question)
        
        db.flush()  # Get question IDs
        
        # Create question options for multiple choice and dropdown questions
        print("🔘 Creating question options...")
        from app.models.question import QuestionOption
        
        # Options for "How are you feeling today?"
        feeling_options = [
            QuestionOption(question_id=questions[3].id, text="Great! 😊", value="great", order_index=1),
            QuestionOption(question_id=questions[3].id, text="Good 🙂", value="good", order_index=2),
            QuestionOption(question_id=questions[3].id, text="Okay 😐", value="okay", order_index=3),
            QuestionOption(question_id=questions[3].id, text="Struggling 😕", value="struggling", order_index=4),
            QuestionOption(question_id=questions[3].id, text="Need support 😔", value="need_support", order_index=5)
        ]
        for option in feeling_options:
            db.add(option)
        
        # Options for "Which project are you currently working on?"
        project_options = [
            QuestionOption(question_id=questions[5].id, text="User Authentication System", value="auth_system", order_index=1),
            QuestionOption(question_id=questions[5].id, text="Mobile App Development", value="mobile_app", order_index=2),
            QuestionOption(question_id=questions[5].id, text="API Integration", value="api_integration", order_index=3),
            QuestionOption(question_id=questions[5].id, text="Database Optimization", value="db_optimization", order_index=4),
            QuestionOption(question_id=questions[5].id, text="Testing & QA", value="testing_qa", order_index=5),
            QuestionOption(question_id=questions[5].id, text="Documentation", value="documentation", order_index=6)
        ]
        for option in project_options:
            db.add(option)
        
        # Options for "Do you need help with anything?"
        help_options = [
            QuestionOption(question_id=questions[7].id, text="Technical guidance", value="technical_help", order_index=1),
            QuestionOption(question_id=questions[7].id, text="Resource allocation", value="resource_help", order_index=2),
            QuestionOption(question_id=questions[7].id, text="Process clarification", value="process_help", order_index=3),
            QuestionOption(question_id=questions[7].id, text="Team coordination", value="coordination_help", order_index=4),
            QuestionOption(question_id=questions[7].id, text="No help needed", value="no_help", order_index=5)
        ]
        for option in help_options:
            db.add(option)
        
        db.flush()  # Get option IDs
        
        # Create sample ceremonies
        print("📅 Creating sample ceremonies...")
        
        # Daily Stand-up ceremony
        daily_ceremony = Ceremony(
            name="Daily Stand-up",
            description="Daily team synchronization meeting",
            team_id=team.id,
            cadence="daily",
            start_time=time(9, 0),  # 9:00 AM
            timezone="America/Los_Angeles",
            send_notifications=True,
            notification_lead_time=15,
            chat_notifications_enabled=True,
            chat_webhook_url="https://hooks.slack.com/services/sample/webhook",
            is_active=True,
            status="active"
        )
        db.add(daily_ceremony)
        
        # Weekly Retrospective ceremony
        weekly_ceremony = Ceremony(
            name="Weekly Retrospective",
            description="Weekly team reflection and improvement session",
            team_id=team.id,
            cadence="weekly",
            start_time=time(16, 0),  # 4:00 PM
            timezone="America/Los_Angeles",
            send_notifications=True,
            notification_lead_time=30,
            chat_notifications_enabled=False,
            is_active=True,
            status="active"
        )
        db.add(weekly_ceremony)
        
        # Monthly Planning ceremony
        monthly_ceremony = Ceremony(
            name="Monthly Planning",
            description="Monthly goal setting and planning session",
            team_id=team.id,
            cadence="monthly",
            start_time=time(10, 0),  # 10:00 AM
            timezone="America/Los_Angeles",
            send_notifications=True,
            notification_lead_time=60,
            chat_notifications_enabled=False,
            is_active=True,
            status="active"
        )
        db.add(monthly_ceremony)
        
        db.flush()
        
        # Link questions to ceremonies
        print("🔗 Linking questions to ceremonies...")
        
        # Daily Stand-up questions (core questions)
        daily_questions = [
            CeremonyQuestion(
                ceremony_id=daily_ceremony.id,
                question_id=questions[0].id,  # What did you work on yesterday?
                order_index=1,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=daily_ceremony.id,
                question_id=questions[1].id,  # What are you working on today?
                order_index=2,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=daily_ceremony.id,
                question_id=questions[2].id,  # Any blockers?
                order_index=3,
                is_required=False
            ),
            CeremonyQuestion(
                ceremony_id=daily_ceremony.id,
                question_id=questions[5].id,  # Which project?
                order_index=4,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=daily_ceremony.id,
                question_id=questions[7].id,  # Need help?
                order_index=5,
                is_required=False
            )
        ]
        for cq in daily_questions:
            db.add(cq)
        
        # Weekly Retrospective questions (reflection focused)
        weekly_questions = [
            CeremonyQuestion(
                ceremony_id=weekly_ceremony.id,
                question_id=questions[3].id,  # How are you feeling?
                order_index=1,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=weekly_ceremony.id,
                question_id=questions[4].id,  # Energy level?
                order_index=2,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=weekly_ceremony.id,
                question_id=questions[6].id,  # Confidence level?
                order_index=3,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=weekly_ceremony.id,
                question_id=questions[9].id,  # Team collaboration rating?
                order_index=4,
                is_required=True
            )
        ]
        for cq in weekly_questions:
            db.add(cq)
        
        # Monthly Planning questions (planning focused)
        monthly_questions = [
            CeremonyQuestion(
                ceremony_id=monthly_ceremony.id,
                question_id=questions[1].id,  # What are you working on today? (repurposed for monthly goals)
                order_index=1,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=monthly_ceremony.id,
                question_id=questions[5].id,  # Which project?
                order_index=2,
                is_required=True
            ),
            CeremonyQuestion(
                ceremony_id=monthly_ceremony.id,
                question_id=questions[8].id,  # Estimated completion time?
                order_index=3,
                is_required=False
            )
        ]
        for cq in monthly_questions:
            db.add(cq)
        
        # Commit all changes
        db.commit()
        
        print("✅ Database seeded successfully!")
        print("\n📋 Sample Data Created:")
        print(f"🏢 Company: {company.name}")
        print(f"👥 Users: {len([admin_user, manager_user, member1, member2, member3])}")
        print(f"👨‍💼 Team: {team.name}")
        print(f"📅 Ceremonies: {len([daily_ceremony, weekly_ceremony, monthly_ceremony])}")
        print(f"❓ Questions: {len(questions)}")
        print(f"🔘 Question Options: {len(feeling_options) + len(project_options) + len(help_options)}")
        print(f"🔗 Ceremony Questions: {len(daily_questions) + len(weekly_questions) + len(monthly_questions)}")
        
        print("\n🔑 Login Credentials:")
        print("Admin: admin@acme.com / admin123")
        print("Manager: sarah.manager@acme.com / manager123")
        print("Developer: john.dev@acme.com / dev123")
        print("QA: jane.qa@acme.com / qa123")
        print("Designer: bob.design@acme.com / design123")
        
        return True
        
    except Exception as e:
        print(f"❌ Database seeding failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    seed_database()
