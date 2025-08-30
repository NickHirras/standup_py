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

# Seed with sample data (optional but recommended for testing)
python seed_db.py

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

The application comes with a database seeder that creates sample data for testing:

### Sample Company
- **Acme Software Corp** - A fictional software development company

### Sample Users
- **Admin**: `admin@acme.com` / `admin123` (Full system access)
- **Team Manager**: `sarah.manager@acme.com` / `manager123` (Can manage teams)
- **Developer**: `john.dev@acme.com` / `dev123` (Team member)
- **QA Engineer**: `jane.qa@acme.com` / `qa123` (Team member)
- **Designer**: `bob.design@acme.com` / `design123` (Team member)

### Sample Team
- **Product Development Team** - Core development team with 4 members

### Sample Ceremony
- **Daily Stand-up** - Daily team synchronization with 5 questions:
  1. What did you work on yesterday?
  2. What are you working on today?
  3. Any blockers or impediments?
  4. How are you feeling today?
  5. What's your energy level? (1-10 scale)

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

## Next Steps

Once running, you can:
1. Create your first company and admin user
2. Set up teams and ceremonies
3. Configure chat integrations
4. Customize the application for your needs

## Common Commands

```bash
# Start backend (from backend directory)
source venv/bin/activate && python start.py

# Start frontend (from frontend directory)
npm start

# Initialize database
python init_db.py

# Check server status
curl http://localhost:8000/health
```

Happy coding! 🚀
