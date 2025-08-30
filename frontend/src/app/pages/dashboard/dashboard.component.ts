import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Welcome back! Here's what's happening with your teams today.</p>
    </div>

    <div class="grid-container">
      <!-- Team Overview Card -->
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Team Overview</mat-card-title>
          <mat-card-subtitle>Your active teams</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="dashboard-stat">3</div>
          <div class="dashboard-label">Active Teams</div>
          <mat-divider class="mt-16"></mat-divider>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>group</mat-icon>
              <div matListItemTitle>Frontend Team</div>
              <div matListItemLine>5 members</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>group</mat-icon>
              <div matListItemTitle>Backend Team</div>
              <div matListItemLine>4 members</div>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>group</mat-icon>
              <div matListItemTitle>DevOps Team</div>
              <div matListItemLine>3 members</div>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/teams">View All Teams</button>
        </mat-card-actions>
      </mat-card>

      <!-- Today's Ceremonies Card -->
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Today's Ceremonies</mat-card-title>
          <mat-card-subtitle>Upcoming team check-ins</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="dashboard-stat">2</div>
          <div class="dashboard-label">Ceremonies Today</div>
          <mat-divider class="mt-16"></mat-divider>
          <mat-list>
            <mat-list-item>
              <mat-icon matListItemIcon>event</mat-icon>
              <div matListItemTitle>Daily Stand-up</div>
              <div matListItemLine>Frontend Team • 9:00 AM</div>
              <mat-chip color="primary" selected>Pending</mat-chip>
            </mat-list-item>
            <mat-list-item>
              <mat-icon matListItemIcon>event</mat-icon>
              <div matListItemTitle>Weekly Retro</div>
              <div matListItemLine>Backend Team • 2:00 PM</div>
              <mat-chip color="accent" selected>Upcoming</mat-chip>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/ceremonies">View All Ceremonies</button>
        </mat-card-actions>
      </mat-card>

      <!-- Response Rate Card -->
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Response Rate</mat-card-title>
          <mat-card-subtitle>Team participation</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="dashboard-stat">85%</div>
          <div class="dashboard-label">Average Response Rate</div>
          <mat-progress-bar mode="determinate" value="85" class="mt-16"></mat-progress-bar>
          <div class="response-breakdown mt-16">
            <div class="response-item">
              <span>Frontend Team</span>
              <span class="response-percentage">92%</span>
            </div>
            <div class="response-item">
              <span>Backend Team</span>
              <span class="response-percentage">78%</span>
            </div>
            <div class="response-item">
              <span>DevOps Team</span>
              <span class="response-percentage">85%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Actions Card -->
      <mat-card class="dashboard-card">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
          <mat-card-subtitle>Common tasks</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="quick-actions">
            <button mat-raised-button color="primary" class="action-button">
              <mat-icon>add</mat-icon>
              Create Ceremony
            </button>
            <button mat-raised-button color="accent" class="action-button">
              <mat-icon>group_add</mat-icon>
              Add Team Member
            </button>
            <button mat-raised-button class="action-button">
              <mat-icon>schedule</mat-icon>
              Schedule Meeting
            </button>
            <button mat-raised-button class="action-button">
              <mat-icon>analytics</mat-icon>
              View Reports
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .action-button {
      justify-content: flex-start;
      padding: 12px 16px;
      height: auto;
    }
    
    .action-button mat-icon {
      margin-right: 12px;
    }
    
    .response-breakdown {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .response-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
    }
    
    .response-percentage {
      font-weight: 500;
      color: #1976d2;
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Load dashboard data
  }
}
