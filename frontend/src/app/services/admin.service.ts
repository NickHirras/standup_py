import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  total: number;
  active: number;
  recent?: number;
}

export interface UserDashboardStats extends DashboardStats {
  verified: number;
  admins: number;
}

export interface AdminDashboardStats {
  users: UserDashboardStats;
  companies: DashboardStats;
  teams: DashboardStats;
  ceremonies: DashboardStats;
  responses: DashboardStats;
  questions: DashboardStats;
  
  // Flat properties for easy access
  total_users: number;
  total_companies: number;
  total_teams: number;
  total_ceremonies: number;
  total_integrations: number;
  avg_participation_rate: number;
  
  // Growth properties
  user_growth: number;
  company_growth: number;
  team_growth: number;
  ceremony_growth: number;
  integration_growth: number;
  participation_change: number;
  
  // Additional properties
  new_users_this_month: number;
  total_reports_generated: number;
  recent_activity: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  company_id: number;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserManagementResponse {
  users: User[];
  total_count: number;
  skip: number;
  limit: number;
}

export interface Company {
  id: number;
  name: string;
  domain?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CompanyManagementResponse {
  companies: Company[];
  total_count: number;
  skip: number;
  limit: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TeamManagementResponse {
  teams: Team[];
  total_count: number;
  skip: number;
  limit: number;
}

export interface Integration {
  id: number;
  company_id: number;
  platform: string;
  name: string;
  webhook_url?: string;
  bot_token?: string;
  signing_secret?: string;
  app_id?: string;
  client_id?: string;
  client_secret?: string;
  workspace_id?: string;
  workspace_name?: string;
  is_active: boolean;
  is_verified: boolean;
  last_sync?: string;
  created_at: string;
  updated_at?: string;
}

export interface IntegrationManagementResponse {
  integrations: Integration[];
  total_count: number;
  skip: number;
  limit: number;
}

export interface SystemHealthResponse {
  database_status: string;
  total_users: number;
  total_companies: number;
  total_teams: number;
  total_ceremonies: number;
  issues: string[];
  timestamp: string;
}

export interface UserCreate {
  email: string;
  username?: string;
  full_name: string;
  role: string;
  company_id: number;
  timezone?: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
  role?: string;
  company_id?: number;
  timezone?: string;
  password?: string;
}

export interface CompanyCreate {
  name: string;
  domain?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
}

export interface CompanyUpdate {
  name?: string;
  domain?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
}

export interface TeamCreate {
  name: string;
  description?: string;
  company_id: number;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface IntegrationCreate {
  name: string;
  platform: string;
  company_id: number;
  webhook_url?: string;
  bot_token?: string;
  signing_secret?: string;
  app_id?: string;
  client_id?: string;
  client_secret?: string;
  workspace_id?: string;
  workspace_name?: string;
}

export interface IntegrationUpdate {
  name?: string;
  platform?: string;
  webhook_url?: string;
  bot_token?: string;
  signing_secret?: string;
  app_id?: string;
  client_id?: string;
  client_secret?: string;
  workspace_id?: string;
  workspace_name?: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboardStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.apiUrl}/admin/dashboard`);
  }

  // User Management
  getUsers(
    skip: number = 0,
    limit: number = 100,
    company_id?: number,
    role?: string,
    is_active?: boolean,
    is_verified?: boolean,
    search?: string
  ): Observable<UserManagementResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (company_id !== undefined) params = params.set('company_id', company_id.toString());
    if (role) params = params.set('role', role);
    if (is_active !== undefined) params = params.set('is_active', is_active.toString());
    if (is_verified !== undefined) params = params.set('is_verified', is_verified.toString());
    if (search) params = params.set('search', search);

    return this.http.get<UserManagementResponse>(`${this.apiUrl}/admin/users`, { params });
  }

  createUser(userData: UserCreate): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/admin/users`, userData);
  }

  updateUser(userId: number, userData: UserUpdate): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/users/${userId}`, userData);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`);
  }

  activateUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/users/${userId}/activate`, {});
  }

  // Company Management
  getCompanies(
    skip: number = 0,
    limit: number = 100,
    is_active?: boolean,
    search?: string
  ): Observable<CompanyManagementResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (is_active !== undefined) params = params.set('is_active', is_active.toString());
    if (search) params = params.set('search', search);

    return this.http.get<CompanyManagementResponse>(`${this.apiUrl}/admin/companies`, { params });
  }

  createCompany(companyData: CompanyCreate): Observable<Company> {
    return this.http.post<Company>(`${this.apiUrl}/admin/companies`, companyData);
  }

  updateCompany(companyId: number, companyData: CompanyUpdate): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/admin/companies/${companyId}`, companyData);
  }

  deleteCompany(companyId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/companies/${companyId}`);
  }

  // Team Management
  getTeams(
    skip: number = 0,
    limit: number = 100,
    company_id?: number,
    is_active?: boolean,
    search?: string
  ): Observable<TeamManagementResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (company_id !== undefined) params = params.set('company_id', company_id.toString());
    if (is_active !== undefined) params = params.set('is_active', is_active.toString());
    if (search) params = params.set('search', search);

    return this.http.get<TeamManagementResponse>(`${this.apiUrl}/admin/teams`, { params });
  }

  createTeam(teamData: TeamCreate): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/admin/teams`, teamData);
  }

  updateTeam(teamId: number, teamData: TeamUpdate): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/admin/teams/${teamId}`, teamData);
  }

  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/teams/${teamId}`);
  }

  // Integration Management
  getIntegrations(
    skip: number = 0,
    limit: number = 100,
    platform?: string,
    is_active?: boolean
  ): Observable<IntegrationManagementResponse> {
    let params = new HttpParams()
      .set('skip', skip.toString())
      .set('limit', limit.toString());

    if (platform) params = params.set('platform', platform);
    if (is_active !== undefined) params = params.set('is_active', is_active.toString());

    return this.http.get<IntegrationManagementResponse>(`${this.apiUrl}/admin/integrations`, { params });
  }

  createIntegration(integrationData: IntegrationCreate): Observable<Integration> {
    return this.http.post<Integration>(`${this.apiUrl}/admin/integrations`, integrationData);
  }

  updateIntegration(integrationId: number, integrationData: IntegrationUpdate): Observable<Integration> {
    return this.http.put<Integration>(`${this.apiUrl}/admin/integrations/${integrationId}`, integrationData);
  }

  deleteIntegration(integrationId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/integrations/${integrationId}`);
  }

  // System Health
  getSystemHealth(): Observable<SystemHealthResponse> {
    return this.http.get<SystemHealthResponse>(`${this.apiUrl}/admin/system/health`);
  }

  runSystemCleanup(): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/system/maintenance/cleanup`, {});
  }
}
