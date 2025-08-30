# StandUp - Virtual Daily Stand-up Web Application

A comprehensive web application for software development teams to conduct virtual daily stand-ups and team ceremonies.

## Features

- **Multi-Company Support**: Companies can have multiple teams and administrators
- **Team Management**: Create and manage teams with managers and members
- **Ceremony System**: Configurable team ceremonies with various question types
- **User Authentication**: Secure user management with role-based access
- **Chat Integration**: Support for Google Chat, Slack, and Microsoft Teams
- **Notification System**: Automated reminders and updates via chat and email
- **Work Hours Configuration**: Personalized notification scheduling
- **Beautiful UI**: Google Material Design implementation

## Tech Stack

- **Backend**: Python 3 with FastAPI
- **Database**: SQLite
- **Frontend**: Angular with Angular Material
- **Authentication**: JWT tokens
- **Chat Integration**: Webhook-based integrations

## Project Structure

```
standup_py/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # FastAPI application entry point
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # Angular components
│   │   │   ├── services/   # Angular services
│   │   │   ├── models/     # TypeScript interfaces
│   │   │   └── shared/     # Shared modules and utilities
│   │   ├── assets/         # Static assets
│   │   └── styles/         # Global styles
│   ├── package.json        # Node.js dependencies
│   └── angular.json        # Angular configuration
├── .devcontainer/          # Development container configuration
├── docker-compose.yml      # Docker services
└── README.md              # This file
```

## Quick Start

### Using Dev Container (Recommended)

1. Open the project in VS Code with Dev Containers extension
2. The container will automatically build and set up the development environment
3. Backend will be available at http://localhost:8000
4. Frontend will be available at http://localhost:4200

**Note**: If you encounter devcontainer build issues, see the troubleshooting section below.

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python init_db.py  # Initialize database
python seed_db.py  # Seed with sample data (optional)
python start.py    # Start the server
```

#### Frontend
```bash
cd frontend
npm install
ng serve
```

## Sample Data

The application includes sample data for testing:

- **Company**: Acme Software Corp
- **Users**: Admin, Team Manager, Developer, QA Engineer, Designer
- **Team**: Product Development Team
- **Ceremony**: Daily Stand-up with 5 questions

**Login Credentials**:
- Admin: `admin@acme.com` / `admin123`
- Manager: `sarah.manager@acme.com` / `manager123`
- Developer: `john.dev@acme.com` / `dev123`

## Development

- Backend API documentation: http://localhost:8000/docs
- Frontend development server: http://localhost:4200
- Database: SQLite file in backend/data/

## Working Status

✅ **Backend**: Fully functional with FastAPI, database models, and authentication
✅ **Frontend**: Angular application with Material Design components - **NOW WORKING!**
✅ **Database**: SQLite with all models and relationships
✅ **DevContainer**: Fixed and working properly
✅ **API**: Health check and authentication endpoints working
✅ **Frontend Server**: Angular dev server running on port 4200

🔄 **In Progress**: Additional API endpoints for full CRUD operations
🔄 **In Progress**: Chat integration implementations
🔄 **In Progress**: Email notification system

## Troubleshooting

### DevContainer Issues

If you encounter "Failed to install Cursor server" or Docker build errors:

1. **Clean Docker cache**:
   ```bash
   docker system prune -a
   docker builder prune
   ```

2. **Rebuild the container**:
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

3. **Check Docker logs**:
   ```bash
   docker compose logs -f
   ```

4. **Alternative**: Use manual setup (see QUICK_START.md)

### Common Issues

- **Port conflicts**: Change ports in `backend/start.py` and `frontend/angular.json`
- **Dependencies**: Ensure Python 3.11+ and Node.js 18+
- **Database errors**: Run `python init_db.py` to initialize the database
- **Import errors**: Make sure you're in the virtual environment and dependencies are installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
