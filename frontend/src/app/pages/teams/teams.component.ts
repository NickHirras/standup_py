import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TeamsService, Team, TeamMember, TeamManager } from '../../services/teams.service';
import { AuthService } from '../../services/auth.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Teams</h1>
          <p class="page-subtitle">Manage your teams and team members</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createTeam()" 
                  *ngIf="canCreateTeam">
            <mat-icon>add</mat-icon>
            Create Team
          </button>
        </div>
      </div>
    </div>

    <div class="teams-container" *ngIf="!loading">
      <!-- Loading state -->
      <div class="loading-state" *ngIf="teams.length === 0">
        <mat-card class="empty-card">
          <mat-card-content class="empty-content">
            <mat-icon class="empty-icon">group_off</mat-icon>
            <h3>No Teams Yet</h3>
            <p>Get started by creating your first team</p>
            <button mat-raised-button color="primary" (click)="createTeam()" 
                    *ngIf="canCreateTeam">
              <mat-icon>add</mat-icon>
              Create Your First Team
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Teams grid -->
      <div class="teams-grid" *ngIf="teams.length > 0">
        <mat-card class="team-card" *ngFor="let team of teams">
          <mat-card-header>
            <mat-card-title>{{ team.name }}</mat-card-title>
            <mat-card-subtitle>{{ team.description || 'No description' }}</mat-card-subtitle>
            <div class="team-status">
              <mat-chip [color]="team.is_active ? 'accent' : 'warn'" selected>
                {{ team.is_active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </div>
          </mat-card-header>
          
          <mat-card-content>
            <div class="team-stats">
              <div class="stat-item">
                <span class="stat-number">{{ getTeamMemberCount(team.id) }}</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getTeamManagerCount(team.id) }}</span>
                <span class="stat-label">Managers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">Ceremonies</span>
              </div>
            </div>
            
            <mat-divider class="mt-16"></mat-divider>
            
            <h4 class="section-title">Team Members</h4>
            <div class="members-preview" *ngIf="getTeamMemberCount(team.id) > 0; else noMembers">
              <mat-list>
                <mat-list-item *ngFor="let member of getTeamMembers(team.id).slice(0, 3)" class="member-preview">
                  <mat-icon matListItemIcon>person</mat-icon>
                  <div matListItemTitle>User ID: {{ member.user_id }}</div>
                  <div matListItemLine>Member since {{ member.created_at | date:'shortDate' }}</div>
                  <mat-chip color="primary" selected *ngIf="isManager(team.id, member.user_id)">
                    Manager
                  </mat-chip>
                </mat-list-item>
                <mat-list-item *ngIf="getTeamMemberCount(team.id) > 3" class="more-members">
                  <div matListItemTitle>+{{ getTeamMemberCount(team.id) - 3 }} more members</div>
                </mat-list-item>
              </mat-list>
            </div>
            <ng-template #noMembers>
              <div class="no-members">
                <p>No team members yet</p>
              </div>
            </ng-template>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-button color="primary" (click)="viewTeam(team)">
              <mat-icon>visibility</mat-icon>
              View Details
            </button>
            <button mat-button (click)="editTeam(team)" *ngIf="canEditTeam(team)">
              <mat-icon>edit</mat-icon>
              Edit Team
            </button>
            <button mat-icon-button [matMenuTriggerFor]="teamMenu" 
                    *ngIf="canManageTeam(team)">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #teamMenu="matMenu">
              <button mat-menu-item (click)="toggleTeamStatus(team)">
                <mat-icon>{{ team.is_active ? 'block' : 'check_circle' }}</mat-icon>
                <span>{{ team.is_active ? 'Deactivate' : 'Activate' }} Team</span>
              </button>
              <button mat-menu-item color="warn" (click)="deleteTeam(team)" 
                      *ngIf="canDeleteTeam(team)">
                <mat-icon>delete</mat-icon>
                <span>Delete Team</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>

    <!-- Loading spinner -->
    <div class="loading-container" *ngIf="loading">
      <mat-card class="loading-card">
        <mat-card-content class="loading-content">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading teams...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .teams-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .teams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    
    .team-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .team-status {
      position: absolute;
      top: 16px;
      right: 16px;
    }
    
    .team-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 1.5rem;
      font-weight: 500;
      color: #1976d2;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: #666;
    }
    
    .section-title {
      margin: 16px 0 8px 0;
      color: #333;
      font-weight: 500;
    }
    
    .members-preview {
      margin-bottom: 16px;
    }
    
    .member-preview {
      margin-bottom: 8px;
    }
    
    .more-members {
      text-align: center;
      color: #666;
      font-style: italic;
    }
    
    .no-members {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 16px;
    }
    
    .mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin: 0;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .loading-card {
      text-align: center;
      padding: 32px;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .loading-content p {
      margin: 0;
      color: #666;
    }
    
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .empty-card {
      text-align: center;
      padding: 32px;
      max-width: 400px;
    }
    
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
    }
    
    .empty-content h3 {
      margin: 0;
      color: #333;
    }
    
    .empty-content p {
      margin: 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .teams-grid {
        grid-template-columns: 1fr;
      }
      
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .header-actions {
        justify-content: center;
      }
    }
  `]
})
export class TeamsComponent implements OnInit {
  teams: Team[] = [];
  teamMembers: { [teamId: number]: TeamMember[] } = {};
  teamManagers: { [teamId: number]: TeamManager[] } = {};
  loading = true;

  constructor(
    private teamsService: TeamsService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    
    this.teamsService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loadTeamDetails();
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.snackBar.open('Failed to load teams', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadTeamDetails(): void {
    if (this.teams.length === 0) {
      this.loading = false;
      return;
    }

    const memberRequests = this.teams.map(team => 
      this.teamsService.getTeamMembers(team.id).pipe(
        catchError(error => {
          console.error(`Error loading members for team ${team.id}:`, error);
          return of([]);
        })
      )
    );

    const managerRequests = this.teams.map(team => 
      this.teamsService.getTeamManagers(team.id).pipe(
        catchError(error => {
          console.error(`Error loading managers for team ${team.id}:`, error);
          return of([]);
        })
      )
    );

    // Load all team members and managers
    Promise.all([
      Promise.all(memberRequests.map(req => req.toPromise())),
      Promise.all(managerRequests.map(req => req.toPromise()))
    ]).then(([membersResults, managersResults]) => {
      this.teams.forEach((team, index) => {
        this.teamMembers[team.id] = membersResults[index] || [];
        this.teamManagers[team.id] = managersResults[index] || [];
      });
      this.loading = false;
    }).catch(error => {
      console.error('Error loading team details:', error);
      this.loading = false;
    });
  }

  get canCreateTeam(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === 'admin';
  }

  canEditTeam(team: Team): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    if (currentUser.role === 'admin') return true;
    
    return this.teamManagers[team.id]?.some(manager => manager.user_id === currentUser.id) || false;
  }

  canManageTeam(team: Team): boolean {
    return this.canEditTeam(team);
  }

  canDeleteTeam(team: Team): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === 'admin';
  }

  getTeamMemberCount(teamId: number): number {
    return this.teamMembers[teamId]?.length || 0;
  }

  getTeamManagerCount(teamId: number): number {
    return this.teamManagers[teamId]?.length || 0;
  }

  getTeamMembers(teamId: number): TeamMember[] {
    return this.teamMembers[teamId] || [];
  }

  isManager(teamId: number, userId: number): boolean {
    return this.teamManagers[teamId]?.some(manager => manager.user_id === userId) || false;
  }

  createTeam(): void {
    this.router.navigate(['/teams/create']);
  }

  viewTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }

  editTeam(team: Team): void {
    this.router.navigate(['/teams', team.id, 'edit']);
  }

  toggleTeamStatus(team: Team): void {
    this.teamsService.toggleTeamStatus(team.id).subscribe({
      next: () => {
        team.is_active = !team.is_active;
        this.snackBar.open(`Team ${team.is_active ? 'activated' : 'deactivated'} successfully!`, 'Close', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error toggling team status:', error);
        this.snackBar.open('Failed to update team status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to delete team "${team.name}"? This action cannot be undone.`)) {
      this.teamsService.deleteTeam(team.id).subscribe({
        next: () => {
          this.teams = this.teams.filter(t => t.id !== team.id);
          delete this.teamMembers[team.id];
          delete this.teamManagers[team.id];
          this.snackBar.open(`Team "${team.name}" deleted successfully!`, 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error deleting team:', error);
          this.snackBar.open('Failed to delete team', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
