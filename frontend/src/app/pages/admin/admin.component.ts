import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Admin Panel</h1>
      <p class="page-subtitle">Manage company settings, users, and integrations</p>
    </div>

    <mat-card>
      <mat-tab-group>
        <mat-tab label="Users">
          <div class="tab-content">
            <h3>User Management</h3>
            <p>Manage company users, roles, and permissions.</p>
            <button mat-raised-button color="primary" routerLink="/admin/users">
              <mat-icon>people</mat-icon>
              Manage Users
            </button>
          </div>
        </mat-tab>
        
        <mat-tab label="Companies">
          <div class="tab-content">
            <h3>Company Settings</h3>
            <p>Configure company information and settings.</p>
            <button mat-raised-button color="primary" routerLink="/admin/companies">
              <mat-icon>business</mat-icon>
              Company Settings
            </button>
          </div>
        </mat-tab>
        
        <mat-tab label="Integrations">
          <div class="tab-content">
            <h3>Chat Integrations</h3>
            <p>Configure Slack, Google Chat, and Microsoft Teams integrations.</p>
            <button mat-raised-button color="primary" routerLink="/admin/integrations">
              <mat-icon>integration_instructions</mat-icon>
              Manage Integrations
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-card>

    <router-outlet></router-outlet>
  `,
  styles: [`
    .tab-content {
      padding: 24px;
      text-align: center;
    }
    
    .tab-content h3 {
      margin-bottom: 16px;
      color: #1976d2;
    }
    
    .tab-content p {
      margin-bottom: 24px;
      color: #666;
    }
    
    .tab-content button {
      margin: 8px;
    }
    
    .tab-content button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class AdminComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Load admin data
  }
}
