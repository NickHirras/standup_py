import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
// import { MatTimepickerModule } from '@angular/material/timepicker'; // Not available in Angular Material
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    // MatTimepickerModule, // Not available in Angular Material
    MatCheckboxModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Profile</h1>
      <p class="page-subtitle">Manage your profile and preferences</p>
    </div>

    <div class="profile-container">
      <!-- Personal Information -->
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Personal Information</mat-card-title>
          <mat-card-subtitle>Update your personal details</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onProfileSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Full Name</mat-label>
                <input matInput formControlName="fullName" placeholder="Enter your full name">
                <mat-error *ngIf="profileForm.get('fullName')?.hasError('required')">
                  Full name is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Username</mat-label>
                <input matInput formControlName="username" placeholder="Enter username">
                <mat-error *ngIf="profileForm.get('username')?.hasError('required')">
                  Username is required
                </mat-error>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" type="email" placeholder="Enter your email">
                <mat-error *ngIf="profileForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="profileForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Timezone</mat-label>
                <mat-select formControlName="timezone">
                  <mat-option value="UTC">UTC</mat-option>
                  <mat-option value="America/New_York">Eastern Time</mat-option>
                  <mat-option value="America/Chicago">Central Time</mat-option>
                  <mat-option value="America/Denver">Mountain Time</mat-option>
                  <mat-option value="America/Los_Angeles">Pacific Time</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid">
                Update Profile
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Work Schedule -->
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>Work Schedule</mat-card-title>
          <mat-card-subtitle>Configure your work hours and notification preferences</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="scheduleForm" (ngSubmit)="onScheduleSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Start Time</mat-label>
                <input matInput formControlName="startTime" type="time">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>End Time</mat-label>
                <input matInput formControlName="endTime" type="time">
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Notification Time</mat-label>
                <input matInput formControlName="notificationTime" type="time">
                <mat-hint>When to send daily notifications</mat-hint>
              </mat-form-field>
            </div>
            
            <div class="work-days">
              <h4>Work Days</h4>
              <div class="checkbox-group">
                <mat-checkbox formControlName="monday">Monday</mat-checkbox>
                <mat-checkbox formControlName="tuesday">Tuesday</mat-checkbox>
                <mat-checkbox formControlName="wednesday">Wednesday</mat-checkbox>
                <mat-checkbox formControlName="thursday">Thursday</mat-checkbox>
                <mat-checkbox formControlName="friday">Friday</mat-checkbox>
                <mat-checkbox formControlName="saturday">Saturday</mat-checkbox>
                <mat-checkbox formControlName="sunday">Sunday</mat-checkbox>
              </div>
            </div>
            
            <div class="form-actions">
              <button mat-raised-button color="primary" type="submit">
                Update Schedule
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .profile-card {
      margin-bottom: 24px;
    }
    
    .form-actions {
      margin-top: 24px;
      text-align: right;
    }
    
    .work-days {
      margin-top: 24px;
    }
    
    .work-days h4 {
      margin-bottom: 16px;
      color: #333;
    }
    
    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 12px;
    }
    
    .checkbox-group mat-checkbox {
      margin: 0;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  scheduleForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      timezone: ['UTC']
    });

    this.scheduleForm = this.fb.group({
      startTime: ['09:00'],
      endTime: ['17:00'],
      notificationTime: ['09:00'],
      monday: [true],
      tuesday: [true],
      wednesday: [true],
      thursday: [true],
      friday: [true],
      saturday: [false],
      sunday: [false]
    });
  }

  ngOnInit(): void {
    // Load user profile data
  }

  onProfileSubmit(): void {
    if (this.profileForm.valid) {
      console.log('Profile form submitted:', this.profileForm.value);
      // Implement profile update logic
    }
  }

  onScheduleSubmit(): void {
    if (this.scheduleForm.valid) {
      console.log('Schedule form submitted:', this.scheduleForm.value);
      // Implement schedule update logic
    }
  }
}
