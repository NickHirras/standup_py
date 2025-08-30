#!/usr/bin/env python3
"""
Database Initialization Script for StandUp Application

This script initializes a new database with comprehensive seed data for development and testing.
Run this script when setting up a new database instance.

Usage:
    python init_db.py
"""

import sys
import os
from datetime import datetime, timedelta, time
from sqlalchemy.orm import Session

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, get_db
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.company import Company
from app.models.team import Team, TeamMember, TeamManager
from app.models.ceremony import Ceremony, CeremonyQuestion
from app.models.question import Question, QuestionOption, QuestionType
from app.models.response import CeremonyResponse
from app.models.chat_integration import ChatIntegration

def create_tables():
    """Create all database tables"""
    print("🗄️  Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def create_sample_data():
    """Create comprehensive sample data for development and testing"""
    
    # Get database session
    db = next(get_db())
    
    try:
        print("🌱 Seeding database with comprehensive sample data...")
        
        # ============================================================================
        # COMPANIES
        # ============================================================================
        print("📊 Creating companies...")
        
        # TechCorp - Main company
        techcorp = Company(
            name="TechCorp Solutions",
            description="Innovative software development company specializing in web applications, mobile apps, and cloud solutions. We focus on delivering high-quality software that solves real business problems.",
            website="https://techcorp.example.com",
            domain="techcorp.example.com",
            is_active=True
        )
        db.add(techcorp)
        
        # Startup Inc
        startup = Company(
            name="Startup Inc",
            description="Fast-growing fintech startup revolutionizing digital payments and financial services. We're building the future of finance with cutting-edge technology.",
            website="https://startup.example.com",
            domain="startup.example.com",
            is_active=True
        )
        db.add(startup)
        
        # Creative Agency
        creative_agency = Company(
            name="Creative Agency",
            description="Full-service creative agency specializing in branding, web design, and digital marketing. We help businesses tell their story through compelling design.",
            website="https://creative.example.com",
            domain="creative.example.com",
            is_active=True
        )
        db.add(creative_agency)
        
        db.commit()
        print(f"   Created 3 companies")
        
        # ============================================================================
        # USERS
        # ============================================================================
        print("👥 Creating users...")
        
        # TechCorp Users
        techcorp_users = [
            {
                "email": "admin@techcorp.com",
                "username": "admin.techcorp",
                "full_name": "Admin User",
                "password": "admin123",
                "role": UserRole.ADMIN,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            },
            {
                "email": "sarah.manager@techcorp.com",
                "username": "sarah.manager",
                "full_name": "Sarah Johnson",
                "password": "manager123",
                "role": UserRole.USER,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            },
            {
                "email": "john.dev@techcorp.com",
                "username": "john.dev",
                "full_name": "John Smith",
                "password": "dev123",
                "role": UserRole.USER,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            },
            {
                "email": "jane.qa@techcorp.com",
                "username": "jane.qa",
                "full_name": "Jane Davis",
                "password": "qa123",
                "role": UserRole.USER,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            },
            {
                "email": "bob.design@techcorp.com",
                "username": "bob.design",
                "full_name": "Bob Wilson",
                "password": "design123",
                "role": UserRole.USER,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            },
            {
                "email": "mike.devops@techcorp.com",
                "username": "mike.devops",
                "full_name": "Mike Chen",
                "password": "devops123",
                "role": UserRole.USER,
                "company_id": techcorp.id,
                "timezone": "America/New_York"
            }
        ]
        
        # Startup Inc Users
        startup_users = [
            {
                "email": "alice.pm@startup.com",
                "username": "alice.pm",
                "full_name": "Alice Chen",
                "password": "pm123",
                "role": UserRole.USER,
                "company_id": startup.id,
                "timezone": "America/Los_Angeles"
            },
            {
                "email": "david.engineer@startup.com",
                "username": "david.engineer",
                "full_name": "David Rodriguez",
                "password": "engineer123",
                "role": UserRole.USER,
                "company_id": startup.id,
                "timezone": "America/Los_Angeles"
            },
            {
                "email": "emma.data@startup.com",
                "username": "emma.data",
                "full_name": "Emma Thompson",
                "password": "data123",
                "role": UserRole.USER,
                "company_id": startup.id,
                "timezone": "America/Los_Angeles"
            }
        ]
        
        # Creative Agency Users
        creative_users = [
            {
                "email": "lisa.design@creative.com",
                "username": "lisa.design",
                "full_name": "Lisa Anderson",
                "password": "design123",
                "role": UserRole.USER,
                "company_id": creative_agency.id,
                "timezone": "America/Chicago"
            },
            {
                "email": "tom.marketing@creative.com",
                "username": "tom.marketing",
                "full_name": "Tom Williams",
                "password": "marketing123",
                "role": UserRole.USER,
                "company_id": creative_agency.id,
                "timezone": "America/Chicago"
            }
        ]
        
        # Create all users
        all_users = []
        for user_data in techcorp_users + startup_users + creative_users:
            user = User(
                email=user_data["email"],
                username=user_data["username"],
                full_name=user_data["full_name"],
                hashed_password=get_password_hash(user_data["password"]),
                role=user_data["role"],
                company_id=user_data["company_id"],
                is_active=True,
                is_verified=True,
                timezone=user_data["timezone"]
            )
            db.add(user)
            all_users.append(user)
        
        db.commit()
        print(f"   Created {len(all_users)} users")
        
        # ============================================================================
        # TEAMS
        # ============================================================================
        print("🏢 Creating teams...")
        
        teams = []
        
        # TechCorp Teams
        techcorp_teams = [
            {
                "name": "Product Development Team",
                "description": "Core development team responsible for main product features and backend services",
                "company_id": techcorp.id
            },
            {
                "name": "Quality Assurance Team",
                "description": "Ensuring product quality through comprehensive testing and quality processes",
                "company_id": techcorp.id
            },
            {
                "name": "Design Team",
                "description": "UI/UX design and user experience optimization",
                "company_id": techcorp.id
            },
            {
                "name": "DevOps Team",
                "description": "Infrastructure, deployment, and operational excellence",
                "company_id": techcorp.id
            }
        ]
        
        # Startup Teams
        startup_teams = [
            {
                "name": "Core Development Team",
                "description": "Small but mighty team building the core product",
                "company_id": startup.id
            },
            {
                "name": "Data Science Team",
                "description": "Machine learning and data analytics for financial insights",
                "company_id": startup.id
            }
        ]
        
        # Creative Agency Teams
        creative_teams = [
            {
                "name": "Design Studio",
                "description": "Creative design and branding services",
                "company_id": creative_agency.id
            },
            {
                "name": "Marketing Team",
                "description": "Digital marketing and client communication",
                "company_id": creative_agency.id
            }
        ]
        
        # Create all teams
        for team_data in techcorp_teams + startup_teams + creative_teams:
            team = Team(
                name=team_data["name"],
                description=team_data["description"],
                company_id=team_data["company_id"],
                is_active=True
            )
            db.add(team)
            teams.append(team)
        
        db.commit()
        print(f"   Created {len(teams)} teams")
        
        # ============================================================================
        # TEAM MEMBERS
        # ============================================================================
        print("👥 Assigning team members...")
        
        # TechCorp team assignments
        techcorp_team_assignments = [
            {"user_email": "sarah.manager@techcorp.com", "team_name": "Product Development Team"},
            {"user_email": "john.dev@techcorp.com", "team_name": "Product Development Team"},
            {"user_email": "jane.qa@techcorp.com", "team_name": "Quality Assurance Team"},
            {"user_email": "bob.design@techcorp.com", "team_name": "Design Team"},
            {"user_email": "mike.devops@techcorp.com", "team_name": "DevOps Team"},
        ]
        
        # Startup team assignments
        startup_team_assignments = [
            {"user_email": "alice.pm@startup.com", "team_name": "Core Development Team"},
            {"user_email": "david.engineer@startup.com", "team_name": "Core Development Team"},
            {"user_email": "emma.data@startup.com", "team_name": "Data Science Team"},
        ]
        
        # Creative agency team assignments
        creative_team_assignments = [
            {"user_email": "lisa.design@creative.com", "team_name": "Design Studio"},
            {"user_email": "tom.marketing@creative.com", "team_name": "Marketing Team"},
        ]
        
        all_assignments = techcorp_team_assignments + startup_team_assignments + creative_team_assignments
        
        for assignment in all_assignments:
            user = next((u for u in all_users if u.email == assignment["user_email"]), None)
            team = next((t for t in teams if t.name == assignment["team_name"]), None)
            
            if user and team:
                member = TeamMember(
                    user_id=user.id,
                    team_id=team.id,
                    is_active=True
                )
                db.add(member)
        
        # Assign team managers
        manager_assignments = [
            {"user_email": "sarah.manager@techcorp.com", "team_name": "Product Development Team"},
            {"user_email": "jane.qa@techcorp.com", "team_name": "Quality Assurance Team"},
            {"user_email": "bob.design@techcorp.com", "team_name": "Design Team"},
            {"user_email": "mike.devops@techcorp.com", "team_name": "DevOps Team"},
            {"user_email": "alice.pm@startup.com", "team_name": "Core Development Team"},
            {"user_email": "emma.data@startup.com", "team_name": "Data Science Team"},
            {"user_email": "lisa.design@creative.com", "team_name": "Design Studio"},
            {"user_email": "tom.marketing@creative.com", "team_name": "Marketing Team"},
        ]
        
        for assignment in manager_assignments:
            user = next((u for u in all_users if u.email == assignment["user_email"]), None)
            team = next((t for t in teams if t.name == assignment["team_name"]), None)
            
            if user and team:
                manager = TeamManager(
                    user_id=user.id,
                    team_id=team.id
                )
                db.add(manager)
        
        db.commit()
        print("   Created team members and managers")
        
        # ============================================================================
        # QUESTIONS
        # ============================================================================
        print("❓ Creating questions...")
        
        questions = []
        
        # Daily Stand-up Questions
        standup_questions = [
            {
                "text": "What did you work on yesterday?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": True,
                "order": 1
            },
            {
                "text": "What are you working on today?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": True,
                "order": 2
            },
            {
                "text": "Any blockers or impediments?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": False,
                "order": 3
            },
            {
                "text": "How are you feeling today?",
                "type": QuestionType.MULTIPLE_CHOICE,
                "is_required": True,
                "order": 4,
                "options": ["Great", "Good", "Okay", "Struggling", "Overwhelmed"]
            },
            {
                "text": "What's your energy level? (1-10)",
                "type": QuestionType.LINEAR_SCALE,
                "is_required": True,
                "order": 5,
                "min_value": 1,
                "max_value": 10
            },
            {
                "text": "Any wins or achievements to share?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": False,
                "order": 6
            }
        ]
        
        # Retrospective Questions
        retro_questions = [
            {
                "text": "What went well this week?",
                "type": QuestionType.PARAGRAPH,
                "is_required": True,
                "order": 1
            },
            {
                "text": "What could have gone better?",
                "type": QuestionType.PARAGRAPH,
                "is_required": True,
                "order": 2
            },
            {
                "text": "What actions will we take next week?",
                "type": QuestionType.PARAGRAPH,
                "is_required": True,
                "order": 3
            },
            {
                "text": "How satisfied are you with the team's collaboration?",
                "type": QuestionType.LINEAR_SCALE,
                "is_required": True,
                "order": 4,
                "min_value": 1,
                "max_value": 5
            }
        ]
        
        # Planning Questions
        planning_questions = [
            {
                "text": "What are your top 3 priorities for this sprint?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": True,
                "order": 1
            },
            {
                "text": "What dependencies do you have?",
                "type": QuestionType.SHORT_ANSWER,
                "is_required": False,
                "order": 2
            },
            {
                "text": "How confident are you in completing your commitments?",
                "type": QuestionType.MULTIPLE_CHOICE,
                "is_required": True,
                "order": 3,
                "options": ["Very Confident", "Confident", "Somewhat Confident", "Not Confident"]
            }
        ]
        
        # Create all questions
        all_question_data = standup_questions + retro_questions + planning_questions
        
        for q_data in all_question_data:
            question = Question(
                text=q_data["text"],
                question_type=q_data["type"].value,
                is_required=q_data["is_required"],
                order_index=q_data["order"],
                min_value=q_data.get("min_value"),
                max_value=q_data.get("max_value")
            )
            db.add(question)
            questions.append(question)
        
        # Commit questions first to get their IDs
        db.commit()
        print(f"   Created {len(questions)} questions")
        
        # Now create options for multiple choice questions
        for i, q_data in enumerate(all_question_data):
            if q_data["type"] == QuestionType.MULTIPLE_CHOICE and "options" in q_data:
                question = questions[i]
                for j, option_text in enumerate(q_data["options"]):
                    option = QuestionOption(
                        question_id=question.id,
                        text=option_text,
                        value=option_text.lower().replace(" ", "_"),
                        order_index=j + 1
                    )
                    db.add(option)
        
        # Commit options
        db.commit()
        print("   Created question options")
        
        # ============================================================================
        # CEREMONIES
        # ============================================================================
        print("🎭 Creating ceremonies...")
        
        ceremonies = []
        
        # TechCorp Ceremonies
        techcorp_ceremonies = [
            {
                "name": "Daily Stand-up",
                "description": "Daily team synchronization meeting to discuss progress and blockers",
                "team_name": "Product Development Team",
                "cadence": "daily",
                "start_time": time(9, 0)
            },
            {
                "name": "Weekly Retrospective",
                "description": "Weekly team reflection and improvement session",
                "team_name": "Product Development Team",
                "cadence": "weekly",
                "start_time": time(16, 0)
            },
            {
                "name": "Sprint Planning",
                "description": "Bi-weekly sprint planning and commitment meeting",
                "team_name": "Product Development Team",
                "cadence": "bi_weekly",
                "start_time": time(10, 0)
            },
            {
                "name": "QA Sync",
                "description": "Weekly quality assurance team synchronization",
                "team_name": "Quality Assurance Team",
                "cadence": "weekly",
                "start_time": time(14, 0)
            },
            {
                "name": "Design Review",
                "description": "Weekly design team review and feedback session",
                "team_name": "Design Team",
                "cadence": "weekly",
                "start_time": time(15, 0)
            },
            {
                "name": "DevOps Stand-up",
                "description": "Daily DevOps team status update",
                "team_name": "DevOps Team",
                "cadence": "daily",
                "start_time": time(8, 30)
            }
        ]
        
        # Startup Ceremonies
        startup_ceremonies = [
            {
                "name": "Core Team Stand-up",
                "description": "Daily stand-up for the core development team",
                "team_name": "Core Development Team",
                "cadence": "daily",
                "start_time": time(9, 30)
            },
            {
                "name": "Data Science Sync",
                "description": "Weekly data science team meeting",
                "team_name": "Data Science Team",
                "cadence": "weekly",
                "start_time": time(11, 0)
            }
        ]
        
        # Creative Agency Ceremonies
        creative_ceremonies = [
            {
                "name": "Design Studio Review",
                "description": "Weekly design review and feedback session",
                "team_name": "Design Studio",
                "cadence": "weekly",
                "start_time": time(13, 0)
            },
            {
                "name": "Marketing Sync",
                "description": "Weekly marketing team planning and review",
                "team_name": "Marketing Team",
                "cadence": "weekly",
                "start_time": time(10, 30)
            }
        ]
        
        # Create all ceremonies
        all_ceremony_data = techcorp_ceremonies + startup_ceremonies + creative_ceremonies
        
        for c_data in all_ceremony_data:
            team = next((t for t in teams if t.name == c_data["team_name"]), None)
            if team:
                ceremony = Ceremony(
                    name=c_data["name"],
                    description=c_data["description"],
                    team_id=team.id,
                    cadence=c_data["cadence"],
                    start_time=c_data["start_time"],
                    is_active=True
                )
                db.add(ceremony)
                ceremonies.append(ceremony)
        
        db.commit()
        print(f"   Created {len(ceremonies)} ceremonies")
        
        # ============================================================================
        # CEREMONY QUESTIONS
        # ============================================================================
        print("🔗 Linking questions to ceremonies...")
        
        # Link questions to appropriate ceremonies
        ceremony_question_mappings = [
            # Daily Stand-ups get standup questions
            {"ceremony_name": "Daily Stand-up", "question_indices": [0, 1, 2, 3, 4, 5]},
            {"ceremony_name": "Core Team Stand-up", "question_indices": [0, 1, 2, 3, 4, 5]},
            {"ceremony_name": "DevOps Stand-up", "question_indices": [0, 1, 2, 3, 4]},
            
            # Retrospectives get retro questions
            {"ceremony_name": "Weekly Retrospective", "question_indices": [6, 7, 8, 9]},
            
            # Planning meetings get planning questions
            {"ceremony_name": "Sprint Planning", "question_indices": [10, 11, 12]},
            
            # Other ceremonies get relevant questions
            {"ceremony_name": "QA Sync", "question_indices": [0, 1, 2, 3]},
            {"ceremony_name": "Design Review", "question_indices": [0, 1, 2, 3]},
            {"ceremony_name": "Data Science Sync", "question_indices": [0, 1, 2, 3]},
            {"ceremony_name": "Design Studio Review", "question_indices": [0, 1, 2, 3]},
            {"ceremony_name": "Marketing Sync", "question_indices": [0, 1, 2, 3]},
        ]
        
        for mapping in ceremony_question_mappings:
            ceremony = next((c for c in ceremonies if c.name == mapping["ceremony_name"]), None)
            if ceremony:
                for i, question_index in enumerate(mapping["question_indices"]):
                    if question_index < len(questions):
                        question = questions[question_index]
                        ceremony_question = CeremonyQuestion(
                            ceremony_id=ceremony.id,
                            question_id=question.id,
                            order_index=i + 1,
                            is_required=question.is_required
                        )
                        db.add(ceremony_question)
        
        db.commit()
        print("   Linked questions to ceremonies")
        
        # ============================================================================
        # CHAT INTEGRATIONS
        # ============================================================================
        print("💬 Creating chat integrations...")
        
        # TechCorp integrations
        techcorp_integrations = [
            {
                "name": "TechCorp Slack",
                "platform": "slack",
                "company_id": techcorp.id,
                "webhook_url": "https://hooks.slack.com/services/TECHCORP/WEBHOOK/URL"
            },
            {
                "name": "TechCorp Teams",
                "platform": "teams",
                "company_id": techcorp.id,
                "webhook_url": "https://techcorp.webhook.office.com/webhookb2/TEST/URL"
            }
        ]
        
        # Startup integrations
        startup_integrations = [
            {
                "name": "Startup Slack",
                "platform": "slack",
                "company_id": startup.id,
                "webhook_url": "https://hooks.slack.com/services/STARTUP/WEBHOOK/URL"
            }
        ]
        
        # Creative agency integrations
        creative_integrations = [
            {
                "name": "Creative Discord",
                "platform": "discord",
                "company_id": creative_agency.id,
                "webhook_url": "https://discord.com/api/webhooks/CREATIVE/URL"
            }
        ]
        
        # Create all integrations
        all_integration_data = techcorp_integrations + startup_integrations + creative_integrations
        
        for i_data in all_integration_data:
            integration = ChatIntegration(
                name=i_data["name"],
                platform=i_data["platform"],
                company_id=i_data["company_id"],
                webhook_url=i_data["webhook_url"],
                is_active=True,
                is_verified=True
            )
            db.add(integration)
        
        db.commit()
        print("   Created chat integrations")
        
        # ============================================================================
        # SAMPLE RESPONSES
        # ============================================================================
        print("📝 Creating sample responses...")
        
        # Create sample responses for the past week
        sample_responses = [
            {
                "user_email": "john.dev@techcorp.com",
                "ceremony_name": "Daily Stand-up",
                "days_ago": 1,
                "mood_rating": 8,
                "energy_level": 7
            },
            {
                "user_email": "jane.qa@techcorp.com",
                "ceremony_name": "Daily Stand-up",
                "days_ago": 1,
                "mood_rating": 7,
                "energy_level": 6
            },
            {
                "user_email": "sarah.manager@techcorp.com",
                "ceremony_name": "Daily Stand-up",
                "days_ago": 2,
                "mood_rating": 9,
                "energy_level": 8
            },
            {
                "user_email": "alice.pm@startup.com",
                "ceremony_name": "Core Team Stand-up",
                "days_ago": 1,
                "mood_rating": 8,
                "energy_level": 7
            },
            {
                "user_email": "david.engineer@startup.com",
                "ceremony_name": "Core Team Stand-up",
                "days_ago": 2,
                "mood_rating": 6,
                "energy_level": 5
            }
        ]
        
        for response_data in sample_responses:
            user = next((u for u in all_users if u.email == response_data["user_email"]), None)
            ceremony = next((c for c in ceremonies if c.name == response_data["ceremony_name"]), None)
            
            if user and ceremony:
                # Find the user's team
                team_member = db.query(TeamMember).filter(TeamMember.user_id == user.id).first()
                if team_member:
                    sample_response = CeremonyResponse(
                        ceremony_id=ceremony.id,
                        user_id=user.id,
                        team_id=team_member.team_id,
                        submitted_at=datetime.utcnow() - timedelta(days=response_data["days_ago"], hours=9),
                        completed_at=datetime.utcnow() - timedelta(days=response_data["days_ago"], hours=9, minutes=5),
                        is_complete=True,
                        status="completed",
                        mood_rating=response_data["mood_rating"],
                        energy_level=response_data["energy_level"]
                    )
                    db.add(sample_response)
        
        db.commit()
        print("   Created sample responses")
        
        print("\n✅ Database initialization completed successfully!")
        print("\n📊 Sample Data Summary:")
        print(f"   Companies: {len([techcorp, startup, creative_agency])}")
        print(f"   Users: {len(all_users)}")
        print(f"   Teams: {len(teams)}")
        print(f"   Questions: {len(questions)}")
        print(f"   Ceremonies: {len(ceremonies)}")
        print(f"   Chat Integrations: {len(all_integration_data)}")
        print(f"   Sample Responses: {len(sample_responses)}")
        
        print("\n🔑 Test Account Credentials:")
        print("   Admin: admin@techcorp.com / admin123")
        print("   Manager: sarah.manager@techcorp.com / manager123")
        print("   Developer: john.dev@techcorp.com / dev123")
        print("   QA Engineer: jane.qa@techcorp.com / qa123")
        print("   Designer: bob.design@techcorp.com / design123")
        print("   DevOps: mike.devops@techcorp.com / devops123")
        print("   Product Manager: alice.pm@startup.com / pm123")
        print("   Engineer: david.engineer@startup.com / engineer123")
        print("   Data Scientist: emma.data@startup.com / data123")
        print("   Creative Designer: lisa.design@creative.com / design123")
        print("   Marketer: tom.marketing@creative.com / marketing123")
        
        print("\n🏢 Company Structure:")
        print("   TechCorp Solutions: 6 users, 4 teams, 6 ceremonies")
        print("   Startup Inc: 3 users, 2 teams, 2 ceremonies")
        print("   Creative Agency: 2 users, 2 teams, 2 ceremonies")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("🚀 StandUp Database Initialization")
    print("=" * 50)
    
    try:
        # Create database tables
        create_tables()
        
        # Seed with sample data
        create_sample_data()
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📝 Next steps:")
        print("   1. Start the backend server: python start.py")
        print("   2. Start the frontend: cd ../frontend && npm start")
        print("   3. Login with any of the test accounts above")
        print("   4. Explore the admin panel and team features")
        
    except Exception as e:
        print(f"\n❌ Database initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
