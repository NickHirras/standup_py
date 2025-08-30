# StandUp API Endpoints Documentation

## Overview
This document describes all the available API endpoints for the StandUp application. The API follows RESTful principles and uses JWT authentication.

## Base URL
- **Development**: `http://localhost:8000/api/v1`
- **Production**: Configure via environment variables

## Authentication
All endpoints (except `/auth/login`) require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | No |
| `POST` | `/auth/logout` | User logout | Yes |
| `POST` | `/auth/refresh` | Refresh access token | Yes |
| `GET` | `/auth/me` | Get current user info | Yes |

### 👥 Users (`/users`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/users/` | List all users | Yes | Admin |
| `GET` | `/users/me` | Get current user | Yes | Any |
| `GET` | `/users/{user_id}` | Get user by ID | Yes | Admin or Self |
| `POST` | `/users/` | Create new user | Yes | Admin |
| `PUT` | `/users/{user_id}` | Update user | Yes | Admin or Self |
| `DELETE` | `/users/{user_id}` | Delete user | Yes | Admin |
| `PATCH` | `/users/{user_id}/activate` | Activate/deactivate user | Yes | Admin |
| `PATCH` | `/users/{user_id}/verify` | Verify user account | Yes | Admin |

**Query Parameters:**
- `skip` (int): Number of users to skip (pagination)
- `limit` (int): Maximum number of users to return (max 1000)
- `company_id` (int): Filter by company ID
- `role` (str): Filter by user role
- `is_active` (bool): Filter by active status

### 🏢 Companies (`/companies`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/companies/` | List all companies | Yes | Admin |
| `GET` | `/companies/{company_id}` | Get company by ID | Yes | Admin or Company Member |
| `POST` | `/companies/` | Create new company | Yes | Admin |
| `PUT` | `/companies/{company_id}` | Update company | Yes | Admin |
| `DELETE` | `/companies/{company_id}` | Delete company | Yes | Admin |
| `PATCH` | `/companies/{company_id}/activate` | Activate/deactivate company | Yes | Admin |
| `GET` | `/companies/{company_id}/stats` | Get company statistics | Yes | Admin or Company Member |
| `GET` | `/companies/{company_id}/users` | Get company users | Yes | Admin or Company Member |
| `GET` | `/companies/{company_id}/teams` | Get company teams | Yes | Admin or Company Member |

**Query Parameters:**
- `skip` (int): Number of companies to skip (pagination)
- `limit` (int): Maximum number of companies to return (max 1000)
- `is_active` (bool): Filter by active status

### 👨‍💼 Teams (`/teams`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/teams/` | List teams | Yes | Any (filtered by membership) |
| `GET` | `/teams/{team_id}` | Get team by ID | Yes | Team Member or Admin |
| `POST` | `/teams/` | Create new team | Yes | Admin |
| `PUT` | `/teams/{team_id}` | Update team | Yes | Team Manager or Admin |
| `DELETE` | `/teams/{team_id}` | Delete team | Yes | Admin |
| `PATCH` | `/teams/{team_id}/activate` | Activate/deactivate team | Yes | Admin |

#### Team Members Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/teams/{team_id}/members` | Get team members | Yes | Team Member or Admin |
| `POST` | `/teams/{team_id}/members` | Add team member | Yes | Team Manager or Admin |
| `DELETE` | `/teams/{team_id}/members/{user_id}` | Remove team member | Yes | Team Manager or Admin |

#### Team Managers Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/teams/{team_id}/managers` | Get team managers | Yes | Team Member or Admin |
| `POST` | `/teams/{team_id}/managers` | Add team manager | Yes | Admin |
| `DELETE` | `/teams/{team_id}/managers/{user_id}` | Remove team manager | Yes | Admin |

**Query Parameters:**
- `skip` (int): Number of teams to skip (pagination)
- `limit` (int): Maximum number of teams to return (max 1000)
- `company_id` (int): Filter by company ID
- `is_active` (bool): Filter by active status

### 📅 Ceremonies (`/ceremonies`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/ceremonies/` | List ceremonies | Yes | Any (filtered by team membership) |
| `GET` | `/ceremonies/{ceremony_id}` | Get ceremony by ID | Yes | Team Member or Admin |
| `POST` | `/ceremonies/` | Create new ceremony | Yes | Team Manager or Admin |
| `PUT` | `/ceremonies/{ceremony_id}` | Update ceremony | Yes | Team Manager or Admin |
| `DELETE` | `/ceremonies/{ceremony_id}` | Delete ceremony | Yes | Team Manager or Admin |
| `PATCH` | `/ceremonies/{ceremony_id}/activate` | Activate/deactivate ceremony | Yes | Team Manager or Admin |
| `PATCH` | `/ceremonies/{ceremony_id}/status` | Update ceremony status | Yes | Team Manager or Admin |

#### Ceremony Questions Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/ceremonies/{ceremony_id}/questions` | Get ceremony questions | Yes | Team Member or Admin |
| `POST` | `/ceremonies/{ceremony_id}/questions` | Add question to ceremony | Yes | Team Manager or Admin |
| `PUT` | `/ceremonies/{ceremony_id}/questions/{question_id}` | Update ceremony question | Yes | Team Manager or Admin |
| `DELETE` | `/ceremonies/{ceremony_id}/questions/{question_id}` | Remove question from ceremony | Yes | Team Manager or Admin |

**Query Parameters:**
- `skip` (int): Number of ceremonies to skip (pagination)
- `limit` (int): Maximum number of ceremonies to return (max 1000)
- `team_id` (int): Filter by team ID
- `is_active` (bool): Filter by active status

**Valid Ceremony Statuses:**
- `active` - Ceremony is running
- `paused` - Ceremony is temporarily paused
- `completed` - Ceremony has finished
- `cancelled` - Ceremony was cancelled

### ❓ Questions (`/questions`)

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/questions/` | List questions | Yes | Any |
| `GET` | `/questions/{question_id}` | Get question by ID | Yes | Any |
| `POST` | `/questions/` | Create new question | Yes | Any |
| `PUT` | `/questions/{question_id}` | Update question | Yes | Any |
| `DELETE` | `/questions/{question_id}` | Delete question | Yes | Any |
| `GET` | `/questions/templates` | Get question templates | Yes | Any |

#### Question Options Management

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/questions/{question_id}/options` | Get question options | Yes | Any |
| `POST` | `/questions/{question_id}/options` | Add question option | Yes | Any |
| `PUT` | `/questions/{question_id}/options/{option_id}` | Update question option | Yes | Any |
| `DELETE` | `/questions/{question_id}/options/{option_id}` | Remove question option | Yes | Any |

**Query Parameters:**
- `skip` (int): Number of questions to skip (pagination)
- `limit` (int): Maximum number of questions to return (max 1000)
- `question_type` (str): Filter by question type
- `is_required` (bool): Filter by required status

**Supported Question Types:**
- `short_answer` - Single line text input
- `paragraph` - Multi-line text input
- `multiple_choice` - Single selection from options
- `checkboxes` - Multiple selections from options
- `dropdown` - Dropdown selection from options
- `file_upload` - File upload with type/size restrictions
- `linear_scale` - Numeric scale (e.g., 1-10)
- `multiple_choice_grid` - Grid of multiple choice questions
- `checkbox_grid` - Grid of checkbox questions
- `date` - Date picker
- `time` - Time picker

## Data Models

### User Roles
- `admin` - Full system access
- `user` - Regular user with team-based permissions

### Team Permissions
- `full` - Full team management access
- `limited` - Limited team management access

### Ceremony Cadence
- `daily` - Every day
- `weekly` - Once per week
- `bi-weekly` - Every two weeks
- `monthly` - Once per month
- `custom` - Custom schedule

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error (request body validation)
- `500` - Internal Server Error

Error responses include a `detail` field with the error message.

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Pagination

List endpoints support pagination using `skip` and `limit` query parameters:
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum number of items to return (default: 100, max: 1000)

## Examples

### Creating a New Team
```bash
curl -X POST "http://localhost:8000/api/v1/teams/" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Team",
    "description": "A new team for testing",
    "company_id": 1
  }'
```

### Adding a Member to a Team
```bash
curl -X POST "http://localhost:8000/api/v1/teams/1/members" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 2
  }'
```

### Creating a Ceremony
```bash
curl -X POST "http://localhost:8000/api/v1/ceremonies/" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly Review",
    "description": "Weekly team review meeting",
    "team_id": 1,
    "cadence": "weekly",
    "start_time": "09:00:00",
    "timezone": "America/Los_Angeles",
    "send_notifications": true,
    "notification_lead_time": 15
  }'
```

## Testing

You can test the API using:
1. **Swagger UI**: Visit `http://localhost:8000/docs`
2. **cURL commands**: Use the examples above
3. **Frontend application**: The Angular frontend uses these endpoints

## Next Steps

Future enhancements could include:
- Response caching
- WebSocket support for real-time updates
- File upload handling for ceremony responses
- Advanced scheduling with timezone support
- Email notifications
- Chat integrations (Slack, Google Chat, Microsoft Teams)
