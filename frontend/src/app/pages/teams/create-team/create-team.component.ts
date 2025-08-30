import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { TeamsService, TeamCreate } from '../../../services/teams.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-team',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Create New Team</h1>
      <p class="page-subtitle">Set up a new team for your organization</p>
    </div>

    <div class="form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Team Information</mat-card-title>
          <mat-card-subtitle>Fill in the details for your new team</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="teamForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Team Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter team name">
                <mat-icon matSuffix>group</mat-icon>
                <mat-error *ngIf="teamForm.get('name')?.hasError('required')">
                  Team name is required
                </mat-error>
                <mat-error *ngIf="teamForm.get('name')?.hasError('minlength')">
                  Team name must be at least 3 characters
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" 
                          placeholder="Describe the team's purpose and responsibilities"
                          rows="3"></textarea>
                <mat-icon matSuffix>description</mat-icon>
                <mat-hint>Optional: Provide a brief description of the team</mat-hint>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="teamForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <span *ngIf="!loading">
                  <mat-icon>add</mat-icon>
                  Create Team
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .form-card {
      margin-bottom: 24px;
    }
    
    .form-row {
      margin-bottom: 16px;
    }
    
    .form-field {
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .form-actions button {
      min-width: 120px;
    }
    
    .form-actions button[type="submit"] {
      min-width: 140px;
    }
    
    .mat-mdc-form-field {
      margin-bottom: 8px;
    }
  `]
})
export class CreateTeamComponent implements OnInit {
  teamForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Component initialization
  }

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.loading = true;
      
      const currentUser = this.authService.currentUserValue;
      if (!currentUser) {
        this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
        this.loading = false;
        return;
      }

      const teamData: TeamCreate = {
        name: this.teamForm.value.name,
        description: this.teamForm.value.description || undefined,
        company_id: currentUser.company_id
      };

      this.teamsService.createTeam(teamData).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open(`Team "${response.name}" created successfully!`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/teams']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error creating team:', error);
          const errorMessage = error.error?.detail || error.message || 'Failed to create team';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }
}
