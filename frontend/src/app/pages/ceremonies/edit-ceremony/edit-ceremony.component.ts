import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { CeremoniesService, Ceremony, CeremonyUpdate } from '../../../services/ceremonies.service';
import { TeamsService, Team } from '../../../services/teams.service';

@Component({
  selector: 'app-edit-ceremony',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Edit Ceremony</h1>
      <p class="page-subtitle">Modify ceremony settings and configuration</p>
    </div>

    <div class="form-container">
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading ceremony...</p>
      </div>

      <div *ngIf="!loading && !ceremony" class="error-container">
        <mat-icon class="error-icon">error</mat-icon>
        <h3>Ceremony not found</h3>
        <p>The ceremony you're looking for doesn't exist or you don't have permission to edit it.</p>
        <button mat-raised-button color="primary" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Ceremonies
        </button>
      </div>

      <mat-card *ngIf="!loading && ceremony">
        <mat-card-content>
          <form [formGroup]="ceremonyForm" (ngSubmit)="onSubmit()">
            <!-- Basic Information -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>info</mat-icon>
                Basic Information
              </h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Ceremony Name *</mat-label>
                <input matInput formControlName="name" placeholder="e.g., Daily Stand-up, Weekly Retro">
                <mat-icon matSuffix>event</mat-icon>
                <mat-error *ngIf="ceremonyForm.get('name')?.hasError('required')">
                  Ceremony name is required
                </mat-error>
                <mat-error *ngIf="ceremonyForm.get('name')?.hasError('minlength')">
                  Ceremony name must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" 
                          placeholder="Describe the purpose and goals of this ceremony"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>

              <div class="team-info">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Team</mat-label>
                  <input matInput [value]="getTeamName(ceremony.team_id)" readonly disabled>
                  <mat-icon matSuffix>group</mat-icon>
                  <mat-hint>Team cannot be changed after creation</mat-hint>
                </mat-form-field>
              </div>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Schedule -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>schedule</mat-icon>
                Schedule
              </h3>
              
              <div class="schedule-row">
                <mat-form-field appearance="outline" class="schedule-field">
                  <mat-label>Cadence *</mat-label>
                  <mat-select formControlName="cadence" required>
                    <mat-option value="daily">Daily</mat-option>
                    <mat-option value="weekly">Weekly</mat-option>
                    <mat-option value="bi-weekly">Bi-weekly</mat-option>
                    <mat-option value="monthly">Monthly</mat-option>
                    <mat-option value="custom">Custom schedule</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>repeat</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="schedule-field">
                  <mat-label>Start Time *</mat-label>
                  <input matInput type="time" formControlName="start_time" required>
                  <mat-icon matSuffix>access_time</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="schedule-field">
                  <mat-label>Timezone *</mat-label>
                  <mat-select formControlName="timezone" required>
                    <mat-option value="UTC">UTC</mat-option>
                    <mat-option value="America/New_York">Eastern Time</mat-option>
                    <mat-option value="America/Chicago">Central Time</mat-option>
                    <mat-option value="America/Denver">Mountain Time</mat-option>
                    <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                    <mat-option value="Europe/London">London</mat-option>
                    <mat-option value="Europe/Paris">Paris</mat-option>
                    <mat-option value="Asia/Tokyo">Tokyo</mat-option>
                    <mat-option value="Asia/Shanghai">Shanghai</mat-option>
                  </mat-select>
                  <mat-icon matSuffix>public</mat-icon>
                </mat-form-field>
              </div>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Status -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>settings</mat-icon>
                Status & Configuration
              </h3>
              
              <div class="status-controls">
                <mat-slide-toggle formControlName="is_active" color="primary">
                  Active Ceremony
                </mat-slide-toggle>
                <p class="status-hint">
                  When active, the ceremony will run according to its schedule and send notifications
                </p>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="active">Active</mat-option>
                  <mat-option value="paused">Paused</mat-option>
                  <mat-option value="completed">Completed</mat-option>
                  <mat-option value="cancelled">Cancelled</mat-option>
                </mat-select>
                <mat-icon matSuffix>info</mat-icon>
                <mat-hint>Current status of the ceremony</mat-hint>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>

            <!-- Notifications -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>notifications</mat-icon>
                Notifications
              </h3>
              
              <div class="notification-settings">
                <mat-slide-toggle formControlName="send_notifications" color="primary">
                  Send reminder notifications
                </mat-slide-toggle>
                
                <div class="notification-options" *ngIf="ceremonyForm.get('send_notifications')?.value">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Notification Lead Time (minutes)</mat-label>
                    <input matInput type="number" formControlName="notification_lead_time" 
                           min="1" max="1440" placeholder="15">
                    <mat-icon matSuffix>schedule</mat-icon>
                    <mat-hint>How many minutes before the ceremony to send notifications</mat-hint>
                  </mat-form-field>
                </div>
              </div>

              <div class="chat-notifications">
                <mat-slide-toggle formControlName="chat_notifications_enabled" color="primary">
                  Enable chat notifications
                </mat-slide-toggle>
                
                <div class="chat-options" *ngIf="ceremonyForm.get('chat_notifications_enabled')?.value">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Chat Webhook URL</mat-label>
                    <input matInput formControlName="chat_webhook_url" 
                           placeholder="https://hooks.slack.com/services/...">
                    <mat-icon matSuffix>chat</mat-icon>
                    <mat-hint>Webhook URL for Slack, Microsoft Teams, or Google Chat</mat-hint>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()" [disabled]="saving">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="ceremonyForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
                <span *ngIf="!saving">Save Changes</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .loading-container, .error-container {
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

    .error-container .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-container h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .error-container p {
      margin: 0 0 24px 0;
      color: #666;
      max-width: 400px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
      font-size: 1.2rem;
    }

    .section-divider {
      margin: 32px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .schedule-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .schedule-field {
      width: 100%;
    }

    .team-info {
      margin-bottom: 16px;
    }

    .status-controls {
      margin-bottom: 16px;
    }

    .status-hint {
      margin: 8px 0 0 0;
      font-size: 0.9rem;
      color: #666;
      font-style: italic;
    }

    .notification-settings, .chat-notifications {
      margin-bottom: 24px;
    }

    .notification-options, .chat-options {
      margin-top: 16px;
      padding-left: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .mat-slide-toggle {
      margin-bottom: 16px;
    }

    @media (max-width: 768px) {
      .schedule-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
      
      .form-actions {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class EditCeremonyComponent implements OnInit {
  ceremonyForm: FormGroup;
  ceremony: Ceremony | null = null;
  teams: Team[] = [];
  loading = true;
  saving = false;
  ceremonyId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private ceremoniesService: CeremoniesService,
    private teamsService: TeamsService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.ceremonyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      cadence: ['', Validators.required],
      start_time: ['', Validators.required],
      timezone: ['', Validators.required],
      is_active: [true],
      status: ['active'],
      send_notifications: [true],
      notification_lead_time: [15, [Validators.min(1), Validators.max(1440)]],
      chat_notifications_enabled: [false],
      chat_webhook_url: ['']
    });
  }

  ngOnInit(): void {
    this.ceremonyId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.ceremonyId) {
      this.loadCeremony(this.ceremonyId);
      this.loadTeams();
    } else {
      this.loading = false;
      this.snackBar.open('Invalid ceremony ID', 'Close', { duration: 3000 });
      this.goBack();
    }
  }

  loadCeremony(id: number): void {
    this.ceremoniesService.getCeremony(id).subscribe({
      next: (ceremony) => {
        this.ceremony = ceremony;
        this.populateForm(ceremony);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ceremony:', error);
        this.loading = false;
        this.snackBar.open('Error loading ceremony', 'Close', { duration: 3000 });
      }
    });
  }

  loadTeams(): void {
    this.teamsService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
      }
    });
  }

  populateForm(ceremony: Ceremony): void {
    // Convert time from "09:00:00" to "09:00" for the time input
    const startTime = ceremony.start_time ? ceremony.start_time.substring(0, 5) : '09:00';
    
    this.ceremonyForm.patchValue({
      name: ceremony.name,
      description: ceremony.description || '',
      cadence: ceremony.cadence,
      start_time: startTime,
      timezone: ceremony.timezone,
      is_active: ceremony.is_active,
      status: ceremony.status,
      send_notifications: ceremony.send_notifications,
      notification_lead_time: ceremony.notification_lead_time,
      chat_notifications_enabled: ceremony.chat_notifications_enabled,
      chat_webhook_url: ceremony.chat_webhook_url || ''
    });
  }

  getTeamName(teamId: number): string {
    const team = this.teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  }

  onSubmit(): void {
    if (this.ceremonyForm.valid && this.ceremonyId) {
      this.saving = true;
      
      const updateData: CeremonyUpdate = {
        ...this.ceremonyForm.value,
        start_time: this.ceremonyForm.value.start_time + ':00' // Add seconds for backend
      };

      this.ceremoniesService.updateCeremony(this.ceremonyId, updateData).subscribe({
        next: (updatedCeremony) => {
          this.saving = false;
          this.snackBar.open('Ceremony updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/ceremonies']);
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating ceremony:', error);
          const errorMessage = error.error?.detail || 'Error updating ceremony';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/ceremonies']);
  }
}
