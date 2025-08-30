import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AdminService, AdminDashboardStats } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="admin-header">
      <div class="header-content">
        <h1>Admin Dashboard</h1>
        <p>Manage your system, users, and monitor performance</p>
      </div>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="refreshDashboard()" [disabled]="loading">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>
    </div>

    <!-- Dashboard Statistics -->
    <div class="stats-section" *ngIf="dashboardStats">
      <h2>System Overview</h2>
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>people</mat-icon>
              <h3>Total Users</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.total_users }}</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.user_growth)">
              {{ getChangeText(dashboardStats.user_growth) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>business</mat-icon>
              <h3>Companies</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.total_companies }}</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.company_growth)">
              {{ getChangeText(dashboardStats.company_growth) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>groups</mat-icon>
              <h3>Teams</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.total_teams }}</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.team_growth)">
              {{ getChangeText(dashboardStats.team_growth) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>event</mat-icon>
              <h3>Ceremonies</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.total_ceremonies }}</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.ceremony_growth)">
              {{ getChangeText(dashboardStats.ceremony_growth) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>link</mat-icon>
              <h3>Integrations</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.total_integrations }}</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.integration_growth)">
              {{ getChangeText(dashboardStats.integration_growth) }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-header">
              <mat-icon>trending_up</mat-icon>
              <h3>Participation</h3>
            </div>
            <div class="stat-value">{{ dashboardStats.avg_participation_rate }}%</div>
            <div class="stat-change" [class]="getChangeClass(dashboardStats.participation_change)">
              {{ getChangeText(dashboardStats.participation_change) }}
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Navigation Cards -->
    <div class="navigation-section">
      <h2>Quick Actions</h2>
      <div class="navigation-grid">
        <mat-card class="nav-card" routerLink="/admin/users">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>people</mat-icon>
            </div>
            <h3>User Management</h3>
            <p>Manage users, roles, and permissions</p>
            <div class="nav-stats">
              <span class="stat-chip">
                <mat-icon>person_add</mat-icon>
                {{ dashboardStats?.new_users_this_month || 0 }} new this month
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/admin/companies">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>business</mat-icon>
            </div>
            <h3>Company Management</h3>
            <p>Manage company information and settings</p>
            <div class="nav-stats">
              <span class="stat-chip">
                <mat-icon>domain</mat-icon>
                {{ dashboardStats?.total_companies || 0 }} companies
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/admin/teams">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>groups</mat-icon>
            </div>
            <h3>Team Management</h3>
            <p>Manage teams, members, and hierarchies</p>
            <div class="nav-stats">
              <span class="stat-chip">
                <mat-icon>group_add</mat-icon>
                {{ dashboardStats?.total_teams || 0 }} teams
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/admin/integrations">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>link</mat-icon>
            </div>
            <h3>Integration Management</h3>
            <p>Manage chat integrations and external services</p>
            <div class="nav-stats">
              <span class="stat-chip">
                <mat-icon>settings</mat-icon>
                {{ dashboardStats?.total_integrations || 0 }} active
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/admin/system">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>monitor_heart</mat-icon>
            </div>
            <h3>System Health</h3>
            <p>Monitor system performance and maintenance</p>
            <div class="nav-stats">
              <span class="stat-chip" [class]="getSystemStatusClass()">
                <mat-icon>{{ getSystemStatusIcon() }}</mat-icon>
                {{ getSystemStatusText() }}
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="nav-card" routerLink="/admin/reports">
          <mat-card-content>
            <div class="nav-icon">
              <mat-icon>analytics</mat-icon>
            </div>
            <h3>Reports & Analytics</h3>
            <p>Generate insights and analyze performance</p>
            <div class="nav-stats">
              <span class="stat-chip">
                <mat-icon>insights</mat-icon>
                {{ dashboardStats?.total_reports_generated || 0 }} reports
              </span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section" *ngIf="dashboardStats?.recent_activity">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <div class="activity-item" *ngFor="let activity of dashboardStats?.recent_activity">
          <div class="activity-icon">
            <mat-icon [class]="activity.type">{{ getActivityIcon(activity.type) }}</mat-icon>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-time">{{ activity.timestamp | date:'short' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="loading">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Loading dashboard...</p>
    </div>
  `,
  styles: [`
    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 300;
      margin: 0 0 8px 0;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .stats-section, .navigation-section, .activity-section {
      margin-bottom: 32px;
    }

    .stats-section h2, .navigation-section h2, .activity-section h2 {
      font-size: 1.5rem;
      font-weight: 400;
      margin: 0 0 20px 0;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      text-align: center;
      padding: 20px;
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .stat-header mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
      color: #2196f3;
    }

    .stat-header h3 {
      margin: 0;
      color: #666;
      font-size: 1rem;
      font-weight: 500;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .stat-change {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .stat-change.positive {
      color: #4caf50;
    }

    .stat-change.negative {
      color: #f44336;
    }

    .stat-change.neutral {
      color: #666;
    }

    .navigation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .nav-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .nav-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2196f3, #1976d2);
      margin-bottom: 16px;
    }

    .nav-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: white;
    }

    .nav-card h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .nav-card p {
      margin: 0 0 16px 0;
      color: #666;
      line-height: 1.5;
    }

    .nav-stats {
      display: flex;
      gap: 8px;
    }

    .stat-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 12px;
      background-color: #f5f5f5;
      font-size: 0.75rem;
      color: #666;
    }

    .stat-chip mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .stat-chip.healthy {
      background-color: #e8f5e8;
      color: #4caf50;
    }

    .stat-chip.warning {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .stat-chip.critical {
      background-color: #ffebee;
      color: #f44336;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      background-color: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .activity-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e3f2fd;
    }

    .activity-icon mat-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
      color: #2196f3;
    }

    .activity-icon mat-icon.user {
      color: #4caf50;
    }

    .activity-icon mat-icon.team {
      color: #ff9800;
    }

    .activity-icon mat-icon.system {
      color: #f44336;
    }

    .activity-content {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .activity-description {
      color: #666;
      margin-bottom: 4px;
    }

    .activity-time {
      font-size: 0.875rem;
      color: #999;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .admin-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .navigation-grid {
        grid-template-columns: 1fr;
      }

      .nav-card {
        text-align: center;
      }

      .nav-icon {
        margin: 0 auto 16px auto;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  dashboardStats: AdminDashboardStats | null = null;
  loading = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
        this.snackBar.open('Error loading dashboard statistics', 'Close', { duration: 3000 });
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboardStats();
  }

  getChangeClass(value: number): string {
    if (!value) return 'neutral';
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  }

  getChangeText(value: number): string {
    if (!value) return 'No change';
    const absValue = Math.abs(value);
    return `${value > 0 ? '+' : ''}${absValue.toFixed(1)}%`;
  }

  getSystemStatusClass(): string {
    // This would come from system health data
    return 'healthy';
  }

  getSystemStatusIcon(): string {
    // This would come from system health data
    return 'check_circle';
  }

  getSystemStatusText(): string {
    // This would come from system health data
    return 'All Systems Operational';
  }

  getActivityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'user': 'person',
      'team': 'groups',
      'system': 'settings',
      'ceremony': 'event'
    };
    return iconMap[type] || 'info';
  }
}
