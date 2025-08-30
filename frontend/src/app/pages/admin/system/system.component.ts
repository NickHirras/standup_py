import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AdminService, SystemHealthResponse } from '../../../services/admin.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="system-header">
      <div class="header-content">
        <h2>System Health & Maintenance</h2>
        <p>Monitor system performance and perform maintenance tasks</p>
      </div>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="refreshHealth()" [disabled]="loading">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
        <button mat-raised-button color="accent" (click)="runSystemCleanup()" [disabled]="loading">
          <mat-icon>cleaning_services</mat-icon>
          System Cleanup
        </button>
      </div>
    </div>

    <!-- System Overview -->
    <div class="overview-grid">
      <!-- Overall Health Status -->
      <mat-card class="health-status-card">
        <mat-card-content>
          <div class="status-header">
            <h3>System Status</h3>
            <div class="status-indicator" [class]="overallStatus">
              <mat-icon>{{ getStatusIcon(overallStatus) }}</mat-icon>
              <span>{{ getStatusText(overallStatus) }}</span>
            </div>
          </div>
          <div class="status-details">
            <p>Last updated: {{ lastUpdated | date:'medium' }}</p>
            <p>Uptime: {{ systemInfo?.uptime || 'N/A' }}</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Database Health -->
      <mat-card class="health-card">
        <mat-card-content>
          <div class="card-header">
            <h3>Database</h3>
            <mat-icon [class]="getHealthIcon(systemInfo?.database?.status)">{{ getHealthIcon(systemInfo?.database?.status) }}</mat-icon>
          </div>
          <div class="health-metrics">
            <div class="metric">
              <span class="metric-label">Status:</span>
              <span class="metric-value" [class]="systemInfo?.database?.status">{{ systemInfo?.database?.status || 'Unknown' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Response Time:</span>
              <span class="metric-value">{{ systemInfo?.database?.response_time || 'N/A' }}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Connections:</span>
              <span class="metric-value">{{ systemInfo?.database?.active_connections || 'N/A' }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- API Health -->
      <mat-card class="health-card">
        <mat-card-content>
          <div class="card-header">
            <h3>API Service</h3>
            <mat-icon [class]="getHealthIcon(systemInfo?.api?.status)">{{ getHealthIcon(systemInfo?.api?.status) }}</mat-icon>
          </div>
          <div class="health-metrics">
            <div class="metric">
              <span class="metric-label">Status:</span>
              <span class="metric-value" [class]="systemInfo?.api?.status">{{ systemInfo?.api?.status || 'Unknown' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Response Time:</span>
              <span class="metric-value">{{ systemInfo?.api?.response_time || 'N/A' }}ms</span>
            </div>
            <div class="metric">
              <span class="metric-label">Requests/min:</span>
              <span class="metric-value">{{ systemInfo?.api?.requests_per_minute || 'N/A' }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Storage Health -->
      <mat-card class="health-card">
        <mat-card-content>
          <div class="card-header">
            <h3>Storage</h3>
            <mat-icon [class]="getHealthIcon(systemInfo?.storage?.status)">{{ getHealthIcon(systemInfo?.storage?.status) }}</mat-icon>
          </div>
          <div class="health-metrics">
            <div class="metric">
              <span class="metric-label">Status:</span>
              <span class="metric-value" [class]="systemInfo?.storage?.status">{{ systemInfo?.storage?.status || 'Unknown' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Used Space:</span>
              <span class="metric-value">{{ systemInfo?.storage?.used_space || 'N/A' }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Free Space:</span>
              <span class="metric-value">{{ systemInfo?.storage?.free_space || 'N/A' }}</span>
            </div>
          </div>
          <mat-progress-bar 
            [value]="getStorageUsagePercentage()" 
            [color]="getStorageColor()"
            mode="determinate"
            class="storage-progress"
          ></mat-progress-bar>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Detailed Health Information -->
    <mat-card class="detailed-health-card">
      <mat-card-header>
        <mat-card-title>Detailed System Information</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>info</mat-icon>
              System Details
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="system-details">
            <div class="detail-item">
              <span class="detail-label">Server Version:</span>
              <span class="detail-value">{{ systemInfo?.server_version || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Python Version:</span>
              <span class="detail-value">{{ systemInfo?.python_version || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Database Version:</span>
              <span class="detail-value">{{ systemInfo?.database?.version || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Environment:</span>
              <span class="detail-value">{{ systemInfo?.environment || 'N/A' }}</span>
            </div>
          </div>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>warning</mat-icon>
              Recent Issues
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="issues-list" *ngIf="systemInfo?.recent_issues && systemInfo.recent_issues.length > 0; else noIssues">
            <div class="issue-item" *ngFor="let issue of systemInfo.recent_issues">
              <div class="issue-header">
                <mat-icon [class]="issue.severity">{{ getIssueIcon(issue.severity) }}</mat-icon>
                <span class="issue-severity" [class]="issue.severity">{{ issue.severity }}</span>
                <span class="issue-timestamp">{{ issue.timestamp | date:'short' }}</span>
              </div>
              <div class="issue-message">{{ issue.message }}</div>
            </div>
          </div>
          <ng-template #noIssues>
            <div class="no-issues">
              <mat-icon>check_circle</mat-icon>
              <span>No recent issues detected</span>
            </div>
          </ng-template>
        </mat-expansion-panel>

        <mat-expansion-panel>
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>analytics</mat-icon>
              Performance Metrics
            </mat-panel-title>
          </mat-expansion-panel-header>
          <div class="performance-metrics">
            <div class="metric-row">
              <div class="metric-item">
                <span class="metric-label">CPU Usage:</span>
                <span class="metric-value">{{ systemInfo?.performance?.cpu_usage || 'N/A' }}%</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Memory Usage:</span>
                <span class="metric-value">{{ systemInfo?.performance?.memory_usage || 'N/A' }}%</span>
              </div>
            </div>
            <div class="metric-row">
              <div class="metric-item">
                <span class="metric-label">Disk I/O:</span>
                <span class="metric-value">{{ systemInfo?.performance?.disk_io || 'N/A' }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Network I/O:</span>
                <span class="metric-value">{{ systemInfo?.performance?.network_io || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-card-content>
    </mat-card>

    <!-- Maintenance Tools -->
    <mat-card class="maintenance-card">
      <mat-card-header>
        <mat-card-title>Maintenance Tools</mat-card-title>
        <mat-card-subtitle>System maintenance and optimization utilities</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="maintenance-tools">
          <div class="tool-item">
            <div class="tool-info">
              <h4>Database Cleanup</h4>
              <p>Remove old records, optimize tables, and free up space</p>
            </div>
            <button mat-raised-button color="primary" (click)="runDatabaseCleanup()" [disabled]="loading">
              <mat-icon>cleaning_services</mat-icon>
              Run Cleanup
            </button>
          </div>

          <mat-divider></mat-divider>

          <div class="tool-item">
            <div class="tool-info">
              <h4>Log Rotation</h4>
              <p>Archive old log files and compress them for storage efficiency</p>
            </div>
            <button mat-raised-button color="primary" (click)="rotateLogs()" [disabled]="loading">
              <mat-icon>rotate_right</mat-icon>
              Rotate Logs
            </button>
          </div>

          <mat-divider></mat-divider>

          <div class="tool-item">
            <div class="tool-info">
              <h4>Cache Clear</h4>
              <p>Clear application cache and temporary files</p>
            </div>
            <button mat-raised-button color="primary" (click)="clearCache()" [disabled]="loading">
              <mat-icon>clear_all</mat-icon>
              Clear Cache
            </button>
          </div>

          <mat-divider></mat-divider>

          <div class="tool-item">
            <div class="tool-info">
              <h4>System Restart</h4>
              <p>Restart system services (use with caution)</p>
            </div>
            <button mat-raised-button color="warn" (click)="restartSystem()" [disabled]="loading">
              <mat-icon>restart_alt</mat-icon>
              Restart System
            </button>
          </div>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Loading Overlay -->
    <div class="loading-overlay" *ngIf="loading">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Processing...</p>
    </div>
  `,
  styles: [`
    .system-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .header-content h2 {
      font-size: 1.75rem;
      font-weight: 400;
      margin: 0 0 8px 0;
      color: #333;
    }

    .header-content p {
      margin: 0;
      color: #666;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .health-status-card {
      grid-column: 1 / -1;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .status-header h3 {
      margin: 0;
      color: #333;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      color: white;
    }

    .status-indicator.healthy {
      background-color: #4caf50;
    }

    .status-indicator.warning {
      background-color: #ff9800;
    }

    .status-indicator.critical {
      background-color: #f44336;
    }

    .status-indicator.unknown {
      background-color: #9e9e9e;
    }

    .status-details {
      color: #666;
    }

    .status-details p {
      margin: 4px 0;
    }

    .health-card {
      min-height: 200px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .card-header h3 {
      margin: 0;
      color: #333;
    }

    .card-header mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
    }

    .card-header mat-icon.healthy {
      color: #4caf50;
    }

    .card-header mat-icon.warning {
      color: #ff9800;
    }

    .card-header mat-icon.critical {
      color: #f44336;
    }

    .card-header mat-icon.unknown {
      color: #9e9e9e;
    }

    .health-metrics {
      margin-bottom: 16px;
    }

    .metric {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .metric-label {
      color: #666;
      font-weight: 500;
    }

    .metric-value {
      font-weight: 500;
    }

    .metric-value.healthy {
      color: #4caf50;
    }

    .metric-value.warning {
      color: #ff9800;
    }

    .metric-value.critical {
      color: #f44336;
    }

    .storage-progress {
      margin-top: 8px;
    }

    .detailed-health-card {
      margin-bottom: 24px;
    }

    .system-details, .issues-list, .performance-metrics {
      padding: 16px 0;
    }

    .detail-item, .issue-item, .metric-row {
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      font-weight: 500;
      color: #666;
    }

    .detail-value {
      font-weight: 500;
      color: #333;
    }

    .issue-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .issue-severity {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
    }

    .issue-severity.low {
      background-color: #4caf50;
    }

    .issue-severity.medium {
      background-color: #ff9800;
    }

    .issue-severity.high {
      background-color: #f44336;
    }

    .issue-timestamp {
      color: #666;
      font-size: 0.875rem;
    }

    .issue-message {
      color: #333;
      margin-left: 32px;
    }

    .no-issues {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 500;
    }

    .metric-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .maintenance-card {
      margin-bottom: 24px;
    }

    .maintenance-tools {
      padding: 16px 0;
    }

    .tool-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
    }

    .tool-info h4 {
      margin: 0 0 4px 0;
      color: #333;
    }

    .tool-info p {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-overlay p {
      margin-top: 16px;
      color: #666;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .system-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .overview-grid {
        grid-template-columns: 1fr;
      }

      .tool-item {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .metric-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class SystemComponent implements OnInit, OnDestroy {
  systemInfo: SystemHealthResponse | null = null;
  loading = false;
  overallStatus: 'healthy' | 'warning' | 'critical' | 'unknown' = 'unknown';
  lastUpdated: Date = new Date();
  private healthCheckSubscription?: Subscription;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.refreshHealth();
    // Set up automatic health checks every 30 seconds
    this.healthCheckSubscription = interval(30000).subscribe(() => {
      this.refreshHealth();
    });
  }

  ngOnDestroy(): void {
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
    }
  }

  refreshHealth(): void {
    this.loading = true;
    this.adminService.getSystemHealth().subscribe({
      next: (response) => {
        this.systemInfo = response;
        this.overallStatus = this.calculateOverallStatus();
        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching system health:', error);
        this.loading = false;
        this.snackBar.open('Error fetching system health', 'Close', { duration: 3000 });
      }
    });
  }

  calculateOverallStatus(): 'healthy' | 'warning' | 'critical' | 'unknown' {
    if (!this.systemInfo) return 'unknown';

    const statuses = [
      this.systemInfo.database?.status,
      this.systemInfo.api?.status,
      this.systemInfo.storage?.status
    ];

    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.every(s => s === 'healthy')) return 'healthy';
    return 'unknown';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'healthy': 'check_circle',
      'warning': 'warning',
      'critical': 'error',
      'unknown': 'help'
    };
    return iconMap[status] || 'help';
  }

  getStatusText(status: string): string {
    const textMap: { [key: string]: string } = {
      'healthy': 'All Systems Operational',
      'warning': 'Minor Issues Detected',
      'critical': 'Critical Issues Detected',
      'unknown': 'Status Unknown'
    };
    return textMap[status] || 'Status Unknown';
  }

  getHealthIcon(status: string | undefined): string {
    if (!status) return 'help';
    const iconMap: { [key: string]: string } = {
      'healthy': 'check_circle',
      'warning': 'warning',
      'critical': 'error',
      'unknown': 'help'
    };
    return iconMap[status] || 'help';
  }

  getStorageUsagePercentage(): number {
    if (!this.systemInfo?.storage?.used_space || !this.systemInfo?.storage?.total_space) {
      return 0;
    }
    const used = parseFloat(this.systemInfo.storage.used_space);
    const total = parseFloat(this.systemInfo.storage.total_space);
    return (used / total) * 100;
  }

  getStorageColor(): string {
    const percentage = this.getStorageUsagePercentage();
    if (percentage > 90) return 'warn';
    if (percentage > 75) return 'accent';
    return 'primary';
  }

  getIssueIcon(severity: string): string {
    const iconMap: { [key: string]: string } = {
      'low': 'info',
      'medium': 'warning',
      'high': 'error'
    };
    return iconMap[severity] || 'info';
  }

  runSystemCleanup(): void {
    if (confirm('Are you sure you want to run system cleanup? This may take several minutes.')) {
      this.loading = true;
      this.adminService.runSystemCleanup().subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('System cleanup completed successfully', 'Close', { duration: 3000 });
          this.refreshHealth();
        },
        error: (error) => {
          console.error('Error running system cleanup:', error);
          this.loading = false;
          this.snackBar.open('Error running system cleanup', 'Close', { duration: 3000 });
        }
      });
    }
  }

  runDatabaseCleanup(): void {
    if (confirm('Are you sure you want to run database cleanup? This may affect performance temporarily.')) {
      this.snackBar.open('Database cleanup started...', 'Close', { duration: 2000 });
      // TODO: Implement database cleanup API call
    }
  }

  rotateLogs(): void {
    if (confirm('Are you sure you want to rotate log files?')) {
      this.snackBar.open('Log rotation started...', 'Close', { duration: 2000 });
      // TODO: Implement log rotation API call
    }
  }

  clearCache(): void {
    if (confirm('Are you sure you want to clear all caches? This may temporarily affect performance.')) {
      this.snackBar.open('Cache clearing started...', 'Close', { duration: 2000 });
      // TODO: Implement cache clearing API call
    }
  }

  restartSystem(): void {
    if (confirm('Are you sure you want to restart the system? This will cause temporary downtime.')) {
      this.snackBar.open('System restart initiated...', 'Close', { duration: 2000 });
      // TODO: Implement system restart API call
    }
  }
}
