import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title class="login-title">
            <mat-icon class="login-icon">group</mat-icon>
            StandUp
          </mat-card-title>
          <mat-card-subtitle>Virtual Daily Stand-up</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="Enter your email">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Enter your password">
              <mat-icon matSuffix>lock</mat-icon>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
            </mat-form-field>
            
            <div class="login-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="loginForm.invalid || loading"
                class="login-button">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                <span *ngIf="!loading">Login</span>
              </button>
            </div>
            
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 16px;
    }
    
    .login-card {
      max-width: 400px;
      width: 100%;
      padding: 32px;
    }
    
    .login-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #1976d2;
      margin-bottom: 8px;
    }
    
    .login-icon {
      margin-right: 12px;
      font-size: 2rem;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .login-actions {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
    
    .login-button {
      width: 100%;
      height: 48px;
      font-size: 1.1rem;
    }
    
    .error-message {
      color: #f44336;
      text-align: center;
      margin-top: 16px;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
    }
    
    mat-card-subtitle {
      text-align: center;
      color: #666;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      
      console.log('Attempting login with:', this.loginForm.value);
      console.log('API URL:', this.authService['apiUrl']);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loading = false;
          this.errorMessage = error.error?.detail || error.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
