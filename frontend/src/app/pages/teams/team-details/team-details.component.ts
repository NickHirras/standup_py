import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TeamsService, Team, TeamMember, TeamManager } from '../../../services/teams.service';
import { AuthService } from '../../../services/auth.service';
import { switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <div class="page-header" *ngIf="team">
      <div class="header-content">
        <div>
          <h1 class="page-title">{{ team.name }}</h1>
          <p class="page-subtitle">{{ team.description || 'No description available' }}</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="editTeam()">
            <mat-icon>edit</mat-icon>
            Edit Team
          </button>
          <button mat-icon-button [matMenuTriggerFor]="moreMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #moreMenu="matMenu">
            <button mat-menu-item (click)="toggleTeamStatus()">
              <mat-icon>{{ team.is_active ? 'block' : 'check_circle' }}</mat-icon>
              <span>{{ team.is_active ? 'Deactivate' : 'Activate' }} Team</span>
            </button>
            <button mat-menu-item color="warn" (click)="deleteTeam()" 
                    *ngIf="canDeleteTeam">
              <mat-icon>delete</mat-icon>
              <span>Delete Team</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </div>

    <div class="team-details-container" *ngIf="!loading && team">
      <div class="details-grid">
        <!-- Team Information -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>Team Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-item">
              <span class="info-label">Status:</span>
              <mat-chip [color]="team.is_active ? 'accent' : 'warn'" selected>
                {{ team.is_active ? 'Active' : 'Inactive' }}
              </mat-chip>
            </div>
            <div class="info-item">
              <span class="info-label">Created:</span>
              <span>{{ team.created_at | date:'mediumDate' }}</span>
            </div>
            <div class="info-item" *ngIf="team.updated_at">
              <span class="info-label">Last Updated:</span>
              <span>{{ team.updated_at | date:'mediumDate' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Company ID:</span>
              <span>{{ team.company_id }}</span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Team Statistics -->
        <mat-card class="stats-card">
          <mat-card-header>
            <mat-card-title>Statistics</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-number">{{ teamMembers.length }}</span>
                <span class="stat-label">Members</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ teamManagers.length }}</span>
                <span class="stat-label">Managers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">0</span>
                <span class="stat-label">Ceremonies</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Team Members -->
      <mat-card class="members-card">
        <mat-card-header>
          <mat-card-title>Team Members</mat-card-title>
          <mat-card-subtitle>People who are part of this team</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="members-list" *ngIf="teamMembers.length > 0; else noMembers">
            <mat-list>
              <mat-list-item *ngFor="let member of teamMembers" class="member-item">
                <mat-icon matListItemIcon>person</mat-icon>
                <div matListItemTitle>User ID: {{ member.user_id }}</div>
                <div matListItemLine>Member since {{ member.created_at | date:'mediumDate' }}</div>
                <mat-chip color="primary" selected *ngIf="isManager(member.user_id)">
                  Manager
                </mat-chip>
                <button mat-icon-button [matMenuTriggerFor]="memberMenu" 
                        *ngIf="canManageTeam">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #memberMenu="matMenu">
                  <button mat-menu-item (click)="removeMember(member)">
                    <mat-icon>person_remove</mat-icon>
                    <span>Remove Member</span>
                  </button>
                  <button mat-menu-item (click)="toggleManager(member)" 
                          *ngIf="!isManager(member.user_id)">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <span>Make Manager</span>
                  </button>
                  <button mat-menu-item (click)="removeManager(member)" 
                          *ngIf="isManager(member.user_id)">
                    <mat-icon>person</mat-icon>
                    <span>Remove Manager</span>
                  </button>
                </mat-menu>
              </mat-list-item>
            </mat-list>
          </div>
          <ng-template #noMembers>
            <div class="empty-state">
              <mat-icon class="empty-icon">group_off</mat-icon>
              <p>No team members yet</p>
              <button mat-raised-button color="primary" (click)="addMember()" 
                      *ngIf="canManageTeam">
                <mat-icon>person_add</mat-icon>
                Add Member
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="loading">
      <mat-card class="loading-card">
        <mat-card-content class="loading-content">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading team details...</p>
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
      align-items: flex-start;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .team-details-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .info-card, .stats-card {
      height: fit-content;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .info-item:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 500;
      color: #666;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 500;
      color: #1976d2;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #666;
    }
    
    .members-card {
      margin-bottom: 24px;
    }
    
    .member-item {
      margin-bottom: 8px;
    }
    
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #666;
    }
    
    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
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
    
    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .header-content {
        flex-direction: column;
        gap: 16px;
      }
      
      .header-actions {
        align-self: stretch;
        justify-content: center;
      }
    }
  `]
})
export class TeamDetailsComponent implements OnInit {
  team: Team | null = null;
  teamMembers: TeamMember[] = [];
  teamManagers: TeamManager[] = [];
  loading = true;

  constructor(
    private teamsService: TeamsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTeamDetails();
  }

  loadTeamDetails(): void {
    this.route.params.pipe(
      switchMap(params => {
        const teamId = +params['id'];
        return forkJoin({
          team: this.teamsService.getTeam(teamId),
          members: this.teamsService.getTeamMembers(teamId),
          managers: this.teamsService.getTeamManagers(teamId)
        });
      })
    ).subscribe({
      next: (data) => {
        this.team = data.team;
        this.teamMembers = data.members;
        this.teamManagers = data.managers;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading team details:', error);
        this.snackBar.open('Failed to load team details', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/teams']);
      }
    });
  }

  get canManageTeam(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    if (currentUser.role === 'admin') return true;
    
    return this.teamManagers.some(manager => manager.user_id === currentUser.id);
  }

  get canDeleteTeam(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.role === 'admin';
  }

  isManager(userId: number): boolean {
    return this.teamManagers.some(manager => manager.user_id === userId);
  }

  editTeam(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id, 'edit']);
    }
  }

  toggleTeamStatus(): void {
    if (this.team) {
      this.teamsService.toggleTeamStatus(this.team.id).subscribe({
        next: (response) => {
          this.team!.is_active = !this.team!.is_active;
          this.snackBar.open(`Team ${this.team!.is_active ? 'activated' : 'deactivated'} successfully!`, 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Error toggling team status:', error);
          this.snackBar.open('Failed to update team status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteTeam(): void {
    if (this.team) {
      // TODO: Implement confirmation dialog
      if (confirm(`Are you sure you want to delete team "${this.team.name}"? This action cannot be undone.`)) {
        this.teamsService.deleteTeam(this.team.id).subscribe({
          next: () => {
            this.snackBar.open(`Team "${this.team!.name}" deleted successfully!`, 'Close', {
              duration: 3000
            });
            this.router.navigate(['/teams']);
          },
          error: (error) => {
            console.error('Error deleting team:', error);
            this.snackBar.open('Failed to delete team', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  addMember(): void {
    // TODO: Implement add member functionality
    this.snackBar.open('Add member functionality coming soon!', 'Close', { duration: 3000 });
  }

  removeMember(member: TeamMember): void {
    if (confirm(`Are you sure you want to remove this member from the team?`)) {
      this.teamsService.removeTeamMember(this.team!.id, member.user_id).subscribe({
        next: () => {
          this.teamMembers = this.teamMembers.filter(m => m.id !== member.id);
          this.snackBar.open('Member removed successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.snackBar.open('Failed to remove member', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleManager(member: TeamMember): void {
    // TODO: Implement make manager functionality
    this.snackBar.open('Make manager functionality coming soon!', 'Close', { duration: 3000 });
  }

  removeManager(member: TeamMember): void {
    if (confirm(`Are you sure you want to remove manager privileges from this member?`)) {
      this.teamsService.removeTeamManager(this.team!.id, member.user_id).subscribe({
        next: () => {
          this.teamManagers = this.teamManagers.filter(m => m.user_id !== member.user_id);
          this.snackBar.open('Manager privileges removed successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error removing manager:', error);
          this.snackBar.open('Failed to remove manager privileges', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
