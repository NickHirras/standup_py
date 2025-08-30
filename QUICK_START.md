# Quick Start Guide (Without DevContainer)

If you prefer not to use the devcontainer, you can run the application directly on your system.

## Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Git** for version control

## Quick Setup

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd standup_py
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment (copy and edit as needed)
cp env.example .env

# Initialize the database
python init_db.py

# Note: The database will be automatically initialized with test users when first run
# No need to run seed_db.py - test accounts are created automatically

# Start the backend
python start.py
```

### 3. Frontend Setup (in a new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

### 4. Access the Application
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:4200
- **API Docs**: http://localhost:8000/docs

## Alternative: Use Docker Compose

If you have Docker installed, you can also use:

```bash
# Build and start the container
docker compose up -d

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

## Troubleshooting

### Backend Issues

#### Import Errors
If you get Pydantic import errors:
```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Database Errors
If you get database initialization errors:
```bash
# Make sure you're in the backend directory
cd backend

# Run the database initialization
python init_db.py
```

#### Server Won't Start
If the server fails to start:
```bash
# Check for missing directories
mkdir -p static

# Try importing the app manually
python -c "from main import app; print('App imported successfully')"
```

### Port Conflicts
- Change ports in `backend/start.py` and `frontend/angular.json`
- Or use different ports: `python start.py --port 8001`

### Dependencies Issues
- Ensure you're using Python 3.11+ and Node.js 18+
- Try deleting `node_modules` and `venv` folders and reinstalling



## Sample Data

The application automatically creates comprehensive test data when the database is first initialized:

### Sample Companies
- **TechCorp Solutions** - Technology company with 6 users, 4 teams, 6 ceremonies
- **Startup Inc** - Fintech startup with 3 users, 2 teams, 2 ceremonies
- **Creative Agency** - Creative services company with 2 users, 2 teams, 2 ceremonies

### Sample Users
- **Admin**: `admin@techcorp.com` / `admin123` (Full system access)
- **Manager**: `sarah.manager@techcorp.com` / `manager123` (Team Lead)
- **Developer**: `john.dev@techcorp.com` / `dev123` (Software Developer)
- **QA Engineer**: `jane.qa@techcorp.com` / `qa123` (Quality Assurance)
- **Designer**: `bob.design@techcorp.com` / `design123` (UI/UX Designer)
- **DevOps**: `mike.devops@techcorp.com` / `devops123` (Infrastructure)
- **Product Manager**: `alice.pm@startup.com` / `pm123` (Product Management)
- **Engineer**: `david.engineer@startup.com` / `engineer123` (Software Engineer)
- **Data Scientist**: `emma.data@startup.com` / `data123` (Data Science)
- **Creative Designer**: `lisa.design@creative.com` / `design123` (Creative Design)
- **Marketer**: `tom.marketing@creative.com` / `marketing123` (Digital Marketing)

> **Note**: These are the default test accounts created when the database is initialized. For production use, create your own accounts through the admin panel.

### Sample Teams
- **TechCorp**: Product Development, QA, Design, DevOps teams
- **Startup Inc**: Core Development, Data Science teams
- **Creative Agency**: Design Studio, Marketing teams

### Sample Ceremonies
- **Daily Stand-ups** - Team synchronization with 6 questions:
  1. What did you work on yesterday?
  2. What are you working on today?
  3. Any blockers or impediments?
  4. How are you feeling today? (Multiple choice: Great, Good, Okay, Struggling, Overwhelmed)
  5. What's your energy level? (1-10 scale)
  6. Any wins or achievements to share?
- **Weekly Retrospectives** - Team reflection with 4 questions
- **Sprint Planning** - Planning meetings with 3 questions
- **Team Syncs** - Various team synchronization meetings

### Sample Integrations
- **Slack Integrations** - Company Slack workspaces
- **Teams Integration** - Microsoft Teams workspace
- **Discord Integration** - Creative agency Discord server

## Verification

To verify everything is working:

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/health
   # Should return: {"status":"healthy"}
   ```

2. **API Documentation**:
   - Open http://localhost:8000/docs in your browser
   - You should see the Swagger UI

3. **Frontend**:
   - Open http://localhost:4200 in your browser
   - You should see the StandUp application

## Current Features

The application currently includes:

✅ **User Management**: Complete user CRUD operations with role-based access
✅ **Company Management**: Company creation and management
✅ **Team Management**: Team creation with members and managers
✅ **Admin Panel**: Full administrative interface for system management
✅ **Authentication**: JWT-based login system
✅ **Material Design 3**: Modern, accessible UI following latest design principles

## Next Steps

Once running, you can:
1. Login with the test accounts: `admin@techcorp.com` / `admin123`
2. Access the admin panel to manage users, companies, and teams
3. Create additional users and customize the system
4. Set up ceremonies and team structures
5. Configure chat integrations (when implemented)

## Common Commands

```bash
# Start backend (from backend directory)
source venv/bin/activate && python start.py

# Start frontend (from frontend directory)
npm start

# Initialize database
python init_db.py  # Creates tables and comprehensive sample data

# Check server status
curl http://localhost:8000/health
```

Happy coding! 🚀
