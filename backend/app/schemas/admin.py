from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ============================================================================
# ADMIN DASHBOARD SCHEMAS
# ============================================================================

class DashboardStats(BaseModel):
    total: int
    active: int
    recent: Optional[int] = None

class UserDashboardStats(DashboardStats):
    verified: int
    admins: int

class AdminDashboardStats(BaseModel):
    users: UserDashboardStats
    companies: DashboardStats
    teams: DashboardStats
    ceremonies: DashboardStats
    responses: DashboardStats
    questions: DashboardStats

# ============================================================================
# USER MANAGEMENT SCHEMAS
# ============================================================================

class UserManagementResponse(BaseModel):
    users: List[Any]  # Will be UserResponse objects
    total_count: int
    skip: int
    limit: int

# ============================================================================
# COMPANY MANAGEMENT SCHEMAS
# ============================================================================

class CompanyManagementResponse(BaseModel):
    companies: List[Any]  # Will be CompanyResponse objects
    total_count: int
    skip: int
    limit: int

# ============================================================================
# TEAM MANAGEMENT SCHEMAS
# ============================================================================

class TeamManagementResponse(BaseModel):
    teams: List[Any]  # Will be TeamResponse objects
    total_count: int
    skip: int
    limit: int

# ============================================================================
# INTEGRATION MANAGEMENT SCHEMAS
# ============================================================================

class IntegrationResponse(BaseModel):
    id: int
    company_id: int
    platform: str
    name: str
    webhook_url: Optional[str] = None
    bot_token: Optional[str] = None
    signing_secret: Optional[str] = None
    app_id: Optional[str] = None
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    workspace_id: Optional[str] = None
    workspace_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    last_sync: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class IntegrationManagementResponse(BaseModel):
    integrations: List[IntegrationResponse]
    total_count: int
    skip: int
    limit: int

# ============================================================================
# SYSTEM HEALTH SCHEMAS
# ============================================================================

class SystemHealthResponse(BaseModel):
    database_status: str
    total_users: int
    total_companies: int
    total_teams: int
    total_ceremonies: int
    issues: List[str]
    timestamp: datetime

# ============================================================================
# ADMIN ACTIONS SCHEMAS
# ============================================================================

class BulkActionRequest(BaseModel):
    action: str = Field(..., description="Action to perform: activate, deactivate, delete")
    ids: List[int] = Field(..., description="List of IDs to perform action on")

class BulkActionResponse(BaseModel):
    success_count: int
    failed_count: int
    failed_ids: List[int]
    message: str

# ============================================================================
# ADMIN REPORTS SCHEMAS
# ============================================================================

class UserActivityReport(BaseModel):
    user_id: int
    user_email: str
    user_name: str
    last_login: Optional[datetime] = None
    total_responses: int
    last_response: Optional[datetime] = None
    is_active: bool

class CompanyUsageReport(BaseModel):
    company_id: int
    company_name: str
    total_users: int
    active_users: int
    total_teams: int
    active_teams: int
    total_ceremonies: int
    total_responses: int
    last_activity: Optional[datetime] = None

class SystemUsageReport(BaseModel):
    period: str
    new_users: int
    new_companies: int
    new_teams: int
    total_responses: int
    active_ceremonies: int
    system_load: float
    database_size: str

# ============================================================================
# ADMIN SETTINGS SCHEMAS
# ============================================================================

class SystemSettings(BaseModel):
    max_users_per_company: int = 1000
    max_teams_per_company: int = 100
    max_ceremonies_per_team: int = 50
    max_questions_per_ceremony: int = 20
    max_file_size_mb: int = 10
    allowed_file_types: List[str] = ["pdf", "doc", "docx", "txt", "jpg", "png"]
    session_timeout_minutes: int = 480
    max_login_attempts: int = 5
    password_min_length: int = 8
    require_email_verification: bool = True
    allow_public_registration: bool = False

class AdminSettingsUpdate(BaseModel):
    max_users_per_company: Optional[int] = None
    max_teams_per_company: Optional[int] = None
    max_ceremonies_per_team: Optional[int] = None
    max_questions_per_ceremony: Optional[int] = None
    max_file_size_mb: Optional[int] = None
    allowed_file_types: Optional[List[str]] = None
    session_timeout_minutes: Optional[int] = None
    max_login_attempts: Optional[int] = None
    password_min_length: Optional[int] = None
    require_email_verification: Optional[bool] = None
    allow_public_registration: Optional[bool] = None

# ============================================================================
# ADMIN AUDIT LOG SCHEMAS
# ============================================================================

class AuditLogEntry(BaseModel):
    id: int
    user_id: int
    user_email: str
    action: str
    resource_type: str
    resource_id: int
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}

class AuditLogResponse(BaseModel):
    entries: List[AuditLogEntry]
    total_count: int
    skip: int
    limit: int

# ============================================================================
# ADMIN NOTIFICATION SCHEMAS
# ============================================================================

class AdminNotification(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str  # info, warning, error, critical
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class AdminNotificationResponse(BaseModel):
    notifications: List[AdminNotification]
    total_count: int
    unread_count: int

# ============================================================================
# ADMIN BACKUP & RESTORE SCHEMAS
# ============================================================================

class BackupRequest(BaseModel):
    include_users: bool = True
    include_companies: bool = True
    include_teams: bool = True
    include_ceremonies: bool = True
    include_responses: bool = True
    include_questions: bool = True
    backup_format: str = "json"  # json, csv, sql

class BackupResponse(BaseModel):
    backup_id: str
    filename: str
    size_bytes: int
    created_at: datetime
    status: str  # pending, in_progress, completed, failed
    download_url: Optional[str] = None

class RestoreRequest(BaseModel):
    backup_id: str
    restore_options: Dict[str, bool] = Field(
        default_factory=lambda: {
            "overwrite_existing": False,
            "create_missing": True,
            "validate_data": True
        }
    )

class RestoreResponse(BaseModel):
    restore_id: str
    status: str  # pending, in_progress, completed, failed
    progress_percentage: int
    message: str
    started_at: datetime
    completed_at: Optional[datetime] = None
