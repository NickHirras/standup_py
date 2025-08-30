import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

import { CeremoniesService, CeremonyCreate } from '../../../services/ceremonies.service';
import { TeamsService, Team } from '../../../services/teams.service';

@Component({
  selector: 'app-create-ceremony',
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
      <h1 class="page-title">Create New Ceremony</h1>
      <p class="page-subtitle">Set up a new team ceremony or check-in</p>
    </div>

    <div class="form-container">
      <mat-card>
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
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" 
                          placeholder="Describe the purpose and goals of this ceremony"></textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Team *</mat-label>
                <mat-select formControlName="team_id" required>
                  <mat-option *ngFor="let team of teams" [value]="team.id">
                    {{ team.name }}
                  </mat-option>
                </mat-select>
                <mat-icon matSuffix>group</mat-icon>
                <mat-error *ngIf="ceremonyForm.get('team_id')?.hasError('required')">
                  Please select a team
                </mat-error>
              </mat-form-field>
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
                    <mat-option value="custom">Custom</mat-option>
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
              <button mat-button type="button" (click)="onCancel()" [disabled]="loading">
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="ceremonyForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <span *ngIf="!loading">Create Ceremony</span>
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
export class CreateCeremonyComponent implements OnInit {
  ceremonyForm: FormGroup;
  teams: Team[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private ceremoniesService: CeremoniesService,
    private teamsService: TeamsService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.ceremonyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      team_id: ['', Validators.required],
      cadence: ['daily', Validators.required],
      start_time: ['09:00', Validators.required],
      timezone: ['America/Los_Angeles', Validators.required],
      send_notifications: [true],
      notification_lead_time: [15, [Validators.min(1), Validators.max(1440)]],
      chat_notifications_enabled: [false],
      chat_webhook_url: ['']
    });
  }

  ngOnInit(): void {
    this.loadTeams();
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

  onSubmit(): void {
    if (this.ceremonyForm.valid) {
      this.loading = true;
      
      const ceremonyData: CeremonyCreate = {
        ...this.ceremonyForm.value,
        start_time: this.ceremonyForm.value.start_time + ':00' // Add seconds for backend
      };

      this.ceremoniesService.createCeremony(ceremonyData).subscribe({
        next: (ceremony) => {
          this.loading = false;
          this.snackBar.open('Ceremony created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/ceremonies']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating ceremony:', error);
          const errorMessage = error.error?.detail || 'Error creating ceremony';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/ceremonies']);
  }
}
