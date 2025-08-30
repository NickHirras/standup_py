import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Team {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
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

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  created_at: string;
}

export interface TeamManager {
  id: number;
  team_id: number;
  user_id: number;
  permissions?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all teams
  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.apiUrl}/teams/`);
  }

  // Get team by ID
  getTeam(id: number): Observable<Team> {
    return this.http.get<Team>(`${this.apiUrl}/teams/${id}`);
  }

  // Create new team
  createTeam(team: TeamCreate): Observable<Team> {
    return this.http.post<Team>(`${this.apiUrl}/teams/`, team);
  }

  // Update team
  updateTeam(id: number, team: TeamUpdate): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/teams/${id}`, team);
  }

  // Delete team
  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${id}`);
  }

  // Activate/deactivate team
  toggleTeamStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/teams/${id}/activate`, {});
  }

  // Get team members
  getTeamMembers(teamId: number): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.apiUrl}/teams/${teamId}/members`);
  }

  // Add team member
  addTeamMember(teamId: number, userId: number): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.apiUrl}/teams/${teamId}/members`, { user_id: userId });
  }

  // Remove team member
  removeTeamMember(teamId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}/members/${userId}`);
  }

  // Get team managers
  getTeamManagers(teamId: number): Observable<TeamManager[]> {
    return this.http.get<TeamManager[]>(`${this.apiUrl}/teams/${teamId}/managers`);
  }

  // Add team manager
  addTeamManager(teamId: number, userId: number, permissions?: string): Observable<TeamManager> {
    return this.http.post<TeamManager>(`${this.apiUrl}/teams/${teamId}/managers`, { 
      user_id: userId, 
      permissions: permissions || 'full' 
    });
  }

  // Remove team manager
  removeTeamManager(teamId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${teamId}/managers/${userId}`);
  }
}
