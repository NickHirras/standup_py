# StandUp Project Setup Guide

This guide will help you get the StandUp application up and running on your local development environment.

## Prerequisites

- **Docker and Docker Compose** (for dev container)
- **VS Code** with the Dev Containers extension (recommended)
- **Git** for version control

## Quick Start with Dev Container (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd standup_py
   ```

2. **Open in VS Code with Dev Containers**
   - Install the "Dev Containers" extension in VS Code
   - Open the project folder in VS Code
   - When prompted, click "Reopen in Container"
   - Wait for the container to build and start

3. **The container will automatically:**
   - Install Python dependencies
   - Install Node.js dependencies
   - Initialize the database
   - Set up the development environment

4. **Access the application:**
   - Backend API: http://localhost:8000
   - Frontend: http://localhost:4200
   - API Documentation: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python -c "from app.database import init_db; init_db()"
   ```

6. **Start the backend server**
   ```bash
   python start.py
   # Or use uvicorn directly:
   # uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # Or use the start script:
   # chmod +x start.sh && ./start.sh
   ```

## Project Structure

```
standup_py/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── data/               # SQLite database (created automatically)
│   ├── requirements.txt    # Python dependencies
│   ├── main.py            # FastAPI application entry point
│   └── start.py           # Development server script
├── frontend/               # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # Angular services
│   │   │   └── guards/     # Route guards
│   │   ├── assets/         # Static assets
│   │   └── styles/         # Global styles
│   ├── package.json        # Node.js dependencies
│   └── angular.json        # Angular configuration
├── .devcontainer/          # Development container configuration
├── docker-compose.yml      # Docker services
└── README.md              # Project documentation
```

## Development Workflow

### Backend Development

1. **API Development**
   - Add new models in `backend/app/models/`
   - Create Pydantic schemas in `backend/app/schemas/`
   - Implement API endpoints in `backend/app/api/`
   - The server will auto-reload on file changes

2. **Database Changes**
   - Modify models in `backend/app/models/`
   - Restart the server to apply changes
   - For production, use Alembic migrations

3. **Testing API**
   - Use the interactive docs at http://localhost:8000/docs
   - Test endpoints with tools like Postman or curl

### Frontend Development

1. **Component Development**
   - Create new components in `frontend/src/app/pages/`
   - Use Angular Material components for consistent UI
   - Follow the established component patterns

2. **Service Integration**
   - Implement services in `frontend/src/app/services/`
   - Use the AuthService for authentication
   - Follow Angular best practices

3. **Styling**
   - Use the global styles in `frontend/src/styles.scss`
   - Follow Material Design principles
   - Use CSS Grid and Flexbox for layouts

## Key Features Implemented

### Backend
- ✅ User authentication with JWT tokens
- ✅ Role-based access control (Admin/User)
- ✅ Company and team management
- ✅ Ceremony and question management
- ✅ SQLite database with SQLAlchemy ORM
- ✅ FastAPI with automatic API documentation

### Frontend
- ✅ Angular 17 with standalone components
- ✅ Material Design components and theming
- ✅ Responsive layout with navigation
- ✅ Authentication guards and services
- ✅ Dashboard with team overview
- ✅ Team and ceremony management views

## Configuration

### Environment Variables

Key configuration options in `backend/.env`:

- `SECRET_KEY`: JWT signing secret
- `DATABASE_URL`: Database connection string
- `BACKEND_CORS_ORIGINS`: Allowed frontend origins
- `SMTP_*`: Email configuration
- `SLACK_*`, `GOOGLE_CHAT_*`, `MICROSOFT_TEAMS_*`: Chat integration tokens

### Database

The application uses SQLite by default for development. The database file is automatically created at `backend/data/standup.db`.

## Troubleshooting

### Common Issues

1. **Port conflicts**
   - Backend: Change port in `backend/start.py` or `docker-compose.yml`
   - Frontend: Change port in `frontend/angular.json` or `docker-compose.yml`

2. **Dependencies not found**
   - Backend: Ensure virtual environment is activated
   - Frontend: Run `npm install` in the frontend directory

3. **Database errors**
   - Delete `backend/data/standup.db` and restart the backend
   - Check that all models are properly imported

4. **CORS errors**
   - Verify `BACKEND_CORS_ORIGINS` in your `.env` file
   - Ensure frontend URL is included in the CORS origins

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review the console logs for error messages
- Check the browser developer tools for frontend issues

## Next Steps

This is a foundation implementation. Consider implementing:

1. **Additional API endpoints** for full CRUD operations
2. **Real-time notifications** using WebSockets
3. **File upload handling** for ceremony responses
4. **Email notifications** for ceremony reminders
5. **Chat integration** with Slack, Google Chat, and Microsoft Teams
6. **Advanced scheduling** with timezone support
7. **Reporting and analytics** for team performance
8. **Unit and integration tests**

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

Happy coding! 🚀
