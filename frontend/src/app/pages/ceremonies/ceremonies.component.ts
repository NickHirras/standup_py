import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CeremoniesService, Ceremony } from '../../services/ceremonies.service';
import { TeamsService, Team } from '../../services/teams.service';

@Component({
  selector: 'app-ceremonies',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Ceremonies</h1>
          <p class="page-subtitle">Manage team ceremonies and check-ins</p>
        </div>
        <button mat-raised-button color="primary" (click)="createCeremony()" class="create-button">
          <mat-icon>add</mat-icon>
          Create Ceremony
        </button>
      </div>
    </div>

    <div class="content-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading ceremonies...</p>
      </div>

      <div *ngIf="!loading && ceremonies.length === 0" class="empty-state">
        <mat-icon class="empty-icon">event</mat-icon>
        <h3>No ceremonies yet</h3>
        <p>Create your first team ceremony to get started</p>
        <button mat-raised-button color="primary" (click)="createCeremony()">
          <mat-icon>add</mat-icon>
          Create Ceremony
        </button>
      </div>

      <div *ngIf="!loading && ceremonies.length > 0" class="grid-container">
        <mat-card *ngFor="let ceremony of ceremonies" class="ceremony-card">
          <mat-card-header>
            <mat-card-title>{{ ceremony.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ getTeamName(ceremony.team_id) }} • {{ formatCadence(ceremony.cadence) }} at {{ formatTime(ceremony.start_time) }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="ceremony-status">
              <mat-chip [color]="getStatusColor(ceremony.status)" selected>
                {{ ceremony.status }}
              </mat-chip>
              <span class="next-occurrence">{{ getNextOccurrence(ceremony) }}</span>
            </div>
            
            <div *ngIf="ceremony.description" class="ceremony-description">
              {{ ceremony.description }}
            </div>
            
            <div class="ceremony-features">
              <div class="feature-item" *ngIf="ceremony.send_notifications">
                <mat-icon>notifications</mat-icon>
                <span>Notifications enabled</span>
              </div>
              <div class="feature-item" *ngIf="ceremony.chat_notifications_enabled">
                <mat-icon>chat</mat-icon>
                <span>Chat integration</span>
              </div>
            </div>
            
            <mat-divider class="mt-16"></mat-divider>
            
            <div class="ceremony-actions">
              <button mat-button color="primary" (click)="viewCeremony(ceremony.id)">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button (click)="editCeremony(ceremony.id)">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
              <button mat-button color="accent" (click)="manageQuestions(ceremony.id)">
                <mat-icon>quiz</mat-icon>
                Manage Questions
              </button>
              <button mat-button color="primary" (click)="respondToCeremony(ceremony.id)" 
                      *ngIf="ceremony.is_active">
                <mat-icon>rate_review</mat-icon>
                Respond
              </button>
              <button mat-button [color]="ceremony.is_active ? 'warn' : 'primary'" 
                      (click)="toggleCeremonyStatus(ceremony.id)">
                <mat-icon>{{ ceremony.is_active ? 'pause' : 'play_arrow' }}</mat-icon>
                {{ ceremony.is_active ? 'Pause' : 'Activate' }}
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 32px;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .create-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .content-container {
      min-height: 400px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 16px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .ceremony-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .ceremony-status {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .next-occurrence {
      font-size: 0.9rem;
      color: #666;
    }

    .ceremony-description {
      margin-bottom: 16px;
      color: #555;
      line-height: 1.5;
    }

    .ceremony-features {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: #666;
    }

    .feature-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .ceremony-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .mt-16 {
      margin-top: 16px;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: stretch;
      }

      .create-button {
        justify-content: center;
      }

      .grid-container {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .ceremony-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CeremoniesComponent implements OnInit {
  ceremonies: Ceremony[] = [];
  teams: Team[] = [];
  loading = true;

  constructor(
    private ceremoniesService: CeremoniesService,
    private teamsService: TeamsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    
    // Load ceremonies and teams in parallel
    Promise.all([
      this.ceremoniesService.getCeremonies().toPromise(),
      this.teamsService.getTeams().toPromise()
    ]).then(([ceremonies, teams]) => {
      this.ceremonies = ceremonies || [];
      this.teams = teams || [];
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.snackBar.open('Error loading ceremonies', 'Close', { duration: 3000 });
      this.loading = false;
    });
  }

  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  }

  formatCadence(cadence: string): string {
    const cadenceMap: { [key: string]: string } = {
      'daily': 'Every day',
      'weekly': 'Every week',
      'bi-weekly': 'Every two weeks',
      'monthly': 'Every month',
      'custom': 'Custom schedule'
    };
    return cadenceMap[cadence] || cadence;
  }

  formatTime(time: string): string {
    // Convert "09:00:00" to "9:00 AM"
    if (time) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'active': 'primary',
      'paused': 'accent',
      'completed': 'warn',
      'cancelled': 'warn'
    };
    return statusColors[status] || 'primary';
  }

  getNextOccurrence(ceremony: Ceremony): string {
    // This is a simplified version - in a real app you'd calculate the next occurrence
    if (ceremony.status === 'active') {
      return `Next: ${this.formatCadence(ceremony.cadence)} at ${this.formatTime(ceremony.start_time)}`;
    } else if (ceremony.status === 'paused') {
      return 'Currently paused';
    } else if (ceremony.status === 'completed') {
      return 'Completed';
    } else {
      return 'Cancelled';
    }
  }

  createCeremony(): void {
    this.router.navigate(['/ceremonies/create']);
  }

  viewCeremony(id: number): void {
    this.router.navigate(['/ceremonies', id]);
  }

  editCeremony(id: number): void {
    this.router.navigate(['/ceremonies', id, 'edit']);
  }

  manageQuestions(id: number): void {
    this.router.navigate(['/ceremonies', id, 'questions']);
  }

  respondToCeremony(id: number): void {
    this.router.navigate(['/ceremonies', id, 'respond']);
  }

  toggleCeremonyStatus(id: number): void {
    this.ceremoniesService.toggleCeremonyStatus(id).subscribe({
      next: () => {
        this.snackBar.open('Ceremony status updated', 'Close', { duration: 3000 });
        this.loadData(); // Reload to get updated status
      },
      error: (error) => {
        console.error('Error updating ceremony status:', error);
        this.snackBar.open('Error updating ceremony status', 'Close', { duration: 3000 });
      }
    });
  }
}
