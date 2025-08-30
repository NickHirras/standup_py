import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TeamsService, Team, TeamUpdate } from '../../../services/teams.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-team',
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
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Edit Team</h1>
      <p class="page-subtitle">Update team information and settings</p>
    </div>

    <div class="form-container" *ngIf="!loading && team">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ team.name }}</mat-card-title>
          <mat-card-subtitle>Update team details and configuration</mat-card-subtitle>
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
            
            <div class="form-row">
              <mat-slide-toggle formControlName="is_active" color="primary">
                Team Active
              </mat-slide-toggle>
              <p class="hint-text">
                Active teams can participate in ceremonies and team activities. 
                Inactive teams are hidden from most views.
              </p>
            </div>
            
            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">
                <mat-icon>arrow_back</mat-icon>
                Cancel
              </button>
              <button mat-raised-button color="primary" type="submit" 
                      [disabled]="teamForm.invalid || saving">
                <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
                <span *ngIf="!saving">
                  <mat-icon>save</mat-icon>
                  Save Changes
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <div class="loading-container" *ngIf="loading">
      <mat-card class="loading-card">
        <mat-card-content class="loading-content">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading team information...</p>
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
    
    .hint-text {
      font-size: 0.875rem;
      color: #666;
      margin-top: 8px;
      margin-left: 8px;
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
  `]
})
export class EditTeamComponent implements OnInit {
  teamForm: FormGroup;
  team: Team | null = null;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private teamsService: TeamsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      is_active: [true]
    });
  }

  ngOnInit(): void {
    this.loadTeam();
  }

  loadTeam(): void {
    this.route.params.pipe(
      switchMap(params => {
        const teamId = +params['id'];
        return this.teamsService.getTeam(teamId);
      })
    ).subscribe({
      next: (team) => {
        this.team = team;
        this.teamForm.patchValue({
          name: team.name,
          description: team.description || '',
          is_active: team.is_active
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading team:', error);
        this.snackBar.open('Failed to load team information', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/teams']);
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.valid && this.team) {
      this.saving = true;
      
      const updateData: TeamUpdate = {
        name: this.teamForm.value.name,
        description: this.teamForm.value.description || undefined,
        is_active: this.teamForm.value.is_active
      };

      this.teamsService.updateTeam(this.team.id, updateData).subscribe({
        next: (response) => {
          this.saving = false;
          this.team = response;
          this.snackBar.open(`Team "${response.name}" updated successfully!`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
          this.router.navigate(['/teams']);
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating team:', error);
          const errorMessage = error.error?.detail || error.message || 'Failed to update team';
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
