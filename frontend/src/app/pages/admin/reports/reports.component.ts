import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  template: `
    <div class="reports-header">
      <div class="header-content">
        <h2>Reports & Analytics</h2>
        <p>Generate insights and analyze system performance</p>
      </div>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="generateReport()" [disabled]="loading">
          <mat-icon>assessment</mat-icon>
          Generate Report
        </button>
        <button mat-raised-button color="accent" (click)="exportData()" [disabled]="loading">
          <mat-icon>download</mat-icon>
          Export Data
        </button>
      </div>
    </div>

    <!-- Report Filters -->
    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Report Type</mat-label>
            <mat-select [(ngModel)]="filters.reportType" (selectionChange)="onFilterChange()">
              <mat-option value="user_activity">User Activity</mat-option>
              <mat-option value="ceremony_participation">Ceremony Participation</mat-option>
              <mat-option value="system_performance">System Performance</mat-option>
              <mat-option value="team_metrics">Team Metrics</mat-option>
              <mat-option value="integration_usage">Integration Usage</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date Range</mat-label>
            <mat-select [(ngModel)]="filters.dateRange" (selectionChange)="onFilterChange()">
              <mat-option value="last_7_days">Last 7 Days</mat-option>
              <mat-option value="last_30_days">Last 30 Days</mat-option>
              <mat-option value="last_90_days">Last 90 Days</mat-option>
              <mat-option value="last_year">Last Year</mat-option>
              <mat-option value="custom">Custom Range</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="filters.dateRange === 'custom'">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="filters.startDate" (dateChange)="onFilterChange()">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="filters.dateRange === 'custom'">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="filters.endDate" (dateChange)="onFilterChange()">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Company</mat-label>
            <mat-select [(ngModel)]="filters.companyId" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All Companies</mat-option>
              <mat-option *ngFor="let company of companies" [value]="company.id">
                {{ company.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Team</mat-label>
            <mat-select [(ngModel)]="filters.teamId" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All Teams</mat-option>
              <mat-option *ngFor="let team of teams" [value]="team.id">
                {{ team.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Report Content -->
    <mat-card class="report-content-card">
      <mat-card-content>
        <mat-tab-group>
          <!-- Summary Tab -->
          <mat-tab label="Summary">
            <div class="tab-content">
              <div class="summary-grid">
                <div class="summary-card">
                  <div class="summary-icon">
                    <mat-icon>people</mat-icon>
                  </div>
                  <div class="summary-content">
                    <h3>Total Users</h3>
                    <p class="summary-value">{{ reportData?.summary?.total_users || 0 }}</p>
                    <p class="summary-change" [class]="getChangeClass(reportData?.summary?.user_growth)">
                      {{ getChangeText(reportData?.summary?.user_growth) }}
                    </p>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-icon">
                    <mat-icon>groups</mat-icon>
                  </div>
                  <div class="summary-content">
                    <h3>Active Teams</h3>
                    <p class="summary-value">{{ reportData?.summary?.active_teams || 0 }}</p>
                    <p class="summary-change" [class]="getChangeClass(reportData?.summary?.team_growth)">
                      {{ getChangeText(reportData?.summary?.team_growth) }}
                    </p>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-icon">
                    <mat-icon>event</mat-icon>
                  </div>
                  <div class="summary-content">
                    <h3>Ceremonies</h3>
                    <p class="summary-value">{{ reportData?.summary?.total_ceremonies || 0 }}</p>
                    <p class="summary-change" [class]="getChangeClass(reportData?.summary?.ceremony_growth)">
                      {{ getChangeText(reportData?.summary?.ceremony_growth) }}
                    </p>
                  </div>
                </div>

                <div class="summary-card">
                  <div class="summary-icon">
                    <mat-icon>trending_up</mat-icon>
                  </div>
                  <div class="summary-content">
                    <h3>Participation Rate</h3>
                    <p class="summary-value">{{ reportData?.summary?.participation_rate || 0 }}%</p>
                    <p class="summary-change" [class]="getChangeClass(reportData?.summary?.participation_change)">
                      {{ getChangeText(reportData?.summary?.participation_change) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Chart Placeholder -->
              <div class="chart-container">
                <div class="chart-placeholder">
                  <mat-icon>bar_chart</mat-icon>
                  <h3>Interactive Charts</h3>
                  <p>Charts and visualizations will be implemented here</p>
                  <p>Integration with Chart.js or similar library recommended</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Detailed Data Tab -->
          <mat-tab label="Detailed Data">
            <div class="tab-content">
              <div class="data-table-container">
                <div class="table-header">
                  <h3>Detailed Report Data</h3>
                  <div class="table-actions">
                    <button mat-button (click)="refreshData()" [disabled]="loading">
                      <mat-icon>refresh</mat-icon>
                      Refresh
                    </button>
                    <button mat-button (click)="exportTableData()" [disabled]="!tableData.length">
                      <mat-icon>file_download</mat-icon>
                      Export
                    </button>
                  </div>
                </div>

                <table mat-table [dataSource]="tableData" matSort (matSortChange)="onSortChange($event)">
                  <!-- Dynamic columns based on report type -->
                  <ng-container *ngFor="let column of tableColumns" [matColumnDef]="column.key">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ column.label }}</th>
                    <td mat-cell *matCellDef="let row">{{ row[column.key] }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="tableColumnKeys"></tr>
                  <tr mat-row *matRowDef="let row; columns: tableColumnKeys;"></tr>
                </table>

                <mat-paginator 
                  [length]="totalCount" 
                  [pageSize]="pageSize" 
                  [pageSizeOptions]="[10, 25, 50, 100]"
                  (page)="onPageChange($event)"
                  showFirstLastButtons
                ></mat-paginator>

                <!-- No Data State -->
                <div class="no-data-container" *ngIf="!loading && tableData.length === 0">
                  <mat-icon>analytics</mat-icon>
                  <p>No data available for the selected criteria</p>
                  <button mat-raised-button color="primary" (click)="generateReport()">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Insights Tab -->
          <mat-tab label="Insights">
            <div class="tab-content">
              <div class="insights-container">
                <div class="insight-card" *ngFor="let insight of reportData?.insights || []">
                  <div class="insight-header">
                    <mat-icon [class]="insight.type">{{ getInsightIcon(insight.type) }}</mat-icon>
                    <h4>{{ insight.title }}</h4>
                    <span class="insight-priority" [class]="insight.priority">{{ insight.priority }}</span>
                  </div>
                  <p class="insight-description">{{ insight.description }}</p>
                  <div class="insight-metrics" *ngIf="insight.metrics">
                    <div class="metric-item" *ngFor="let metric of insight.metrics">
                      <span class="metric-label">{{ metric.label }}:</span>
                      <span class="metric-value">{{ metric.value }}</span>
                    </div>
                  </div>
                  <div class="insight-actions">
                    <button mat-button color="primary" (click)="viewInsightDetails(insight)">
                      View Details
                    </button>
                    <button mat-button (click)="dismissInsight(insight)">
                      Dismiss
                    </button>
                  </div>
                </div>

                <!-- No Insights State -->
                <div class="no-insights" *ngIf="!reportData?.insights || reportData.insights.length === 0">
                  <mat-icon>lightbulb</mat-icon>
                  <h3>No Insights Available</h3>
                  <p>Generate a report to see actionable insights and recommendations</p>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>

    <!-- Loading Overlay -->
    <div class="loading-overlay" *ngIf="loading">
      <mat-spinner diameter="50"></mat-spinner>
      <p>Generating report...</p>
    </div>
  `,
  styles: [`
    .reports-header {
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

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .report-content-card {
      margin-bottom: 24px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 8px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
    }

    .summary-icon mat-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #2196f3;
    }

    .summary-content h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
    }

    .summary-value {
      margin: 0 0 4px 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .summary-change {
      margin: 0;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .summary-change.positive {
      color: #4caf50;
    }

    .summary-change.negative {
      color: #f44336;
    }

    .summary-change.neutral {
      color: #666;
    }

    .chart-container {
      margin-top: 32px;
    }

    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      background-color: #f5f5f5;
      border-radius: 8px;
      border: 2px dashed #ccc;
    }

    .chart-placeholder mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .chart-placeholder h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .chart-placeholder p {
      margin: 4px 0;
      color: #999;
    }

    .data-table-container {
      margin-top: 24px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .table-header h3 {
      margin: 0;
      color: #333;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    table {
      width: 100%;
      margin-bottom: 16px;
    }

    .insights-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .insight-card {
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
      background-color: #f8f9fa;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .insight-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .insight-header mat-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .insight-header mat-icon.info {
      color: #2196f3;
    }

    .insight-header mat-icon.warning {
      color: #ff9800;
    }

    .insight-header mat-icon.success {
      color: #4caf50;
    }

    .insight-header h4 {
      margin: 0;
      color: #333;
      flex: 1;
    }

    .insight-priority {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
    }

    .insight-priority.high {
      background-color: #f44336;
    }

    .insight-priority.medium {
      background-color: #ff9800;
    }

    .insight-priority.low {
      background-color: #4caf50;
    }

    .insight-description {
      margin: 0 0 16px 0;
      color: #666;
      line-height: 1.5;
    }

    .insight-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }

    .metric-label {
      color: #666;
      font-weight: 500;
    }

    .metric-value {
      color: #333;
      font-weight: 600;
    }

    .insight-actions {
      display: flex;
      gap: 8px;
    }

    .no-insights {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .no-insights mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-insights h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .no-insights p {
      margin: 0;
      color: #999;
    }

    .no-data-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .no-data-container mat-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data-container p {
      color: #666;
      margin-bottom: 16px;
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
      .reports-header {
        flex-direction: column;
        gap: 16px;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .summary-card {
        flex-direction: column;
        text-align: center;
      }

      .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .insight-metrics {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent implements OnInit, ViewChild {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  loading = false;
  companies: any[] = [];
  teams: any[] = [];
  reportData: any = null;
  tableData: any[] = [];
  tableColumns: any[] = [];
  tableColumnKeys: string[] = [];
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;

  filters = {
    reportType: 'user_activity',
    dateRange: 'last_30_days',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    companyId: undefined as number | undefined,
    teamId: undefined as number | undefined
  };

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadTeams();
    this.generateReport();
  }

  loadCompanies(): void {
    this.adminService.getCompanies(0, 1000).subscribe({
      next: (response) => {
        this.companies = response.companies;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadTeams(): void {
    this.adminService.getTeams(0, 1000).subscribe({
      next: (response) => {
        this.teams = response.teams;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  onFilterChange(): void {
    this.generateReport();
  }

  generateReport(): void {
    this.loading = true;
    
    // Simulate API call - replace with actual API call
    setTimeout(() => {
      this.reportData = this.generateMockReportData();
      this.tableData = this.reportData.tableData || [];
      this.tableColumns = this.getTableColumns();
      this.tableColumnKeys = this.tableColumns.map(col => col.key);
      this.totalCount = this.tableData.length;
      this.loading = false;
    }, 2000);
  }

  generateMockReportData(): any {
    const baseData = {
      summary: {
        total_users: Math.floor(Math.random() * 1000) + 100,
        user_growth: (Math.random() - 0.5) * 20,
        active_teams: Math.floor(Math.random() * 50) + 10,
        team_growth: (Math.random() - 0.5) * 15,
        total_ceremonies: Math.floor(Math.random() * 200) + 50,
        ceremony_growth: (Math.random() - 0.5) * 25,
        participation_rate: Math.floor(Math.random() * 40) + 60,
        participation_change: (Math.random() - 0.5) * 10
      },
      insights: [
        {
          type: 'info',
          title: 'High User Engagement',
          description: 'User participation has increased by 15% compared to last month.',
          priority: 'medium',
          metrics: [
            { label: 'Active Users', value: '85%' },
            { label: 'Avg Session', value: '12 min' }
          ]
        },
        {
          type: 'warning',
          title: 'Team Performance Variance',
          description: 'Some teams show significantly lower participation rates.',
          priority: 'high',
          metrics: [
            { label: 'Low Performers', value: '3 teams' },
            { label: 'Avg Gap', value: '25%' }
          ]
        }
      ]
    };

    // Generate table data based on report type
    switch (this.filters.reportType) {
      case 'user_activity':
        baseData.tableData = this.generateUserActivityData();
        break;
      case 'ceremony_participation':
        baseData.tableData = this.generateCeremonyData();
        break;
      case 'system_performance':
        baseData.tableData = this.generateSystemData();
        break;
      case 'team_metrics':
        baseData.tableData = this.generateTeamData();
        break;
      case 'integration_usage':
        baseData.tableData = this.generateIntegrationData();
        break;
    }

    return baseData;
  }

  generateUserActivityData(): any[] {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        username: `user${i}`,
        full_name: `User ${i}`,
        email: `user${i}@example.com`,
        last_login: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        login_count: Math.floor(Math.random() * 100) + 1,
        status: Math.random() > 0.1 ? 'active' : 'inactive'
      });
    }
    return data;
  }

  generateCeremonyData(): any[] {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        ceremony_name: `Ceremony ${i}`,
        team: `Team ${Math.floor(Math.random() * 10) + 1}`,
        participants: Math.floor(Math.random() * 20) + 5,
        completion_rate: Math.floor(Math.random() * 30) + 70,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }
    return data;
  }

  generateSystemData(): any[] {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        metric: `Metric ${i}`,
        value: Math.floor(Math.random() * 100),
        unit: 'ms',
        threshold: 80,
        status: Math.random() > 0.2 ? 'healthy' : 'warning'
      });
    }
    return data;
  }

  generateTeamData(): any[] {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        team_name: `Team ${i}`,
        company: `Company ${Math.floor(Math.random() * 5) + 1}`,
        members: Math.floor(Math.random() * 15) + 5,
        ceremonies_held: Math.floor(Math.random() * 20) + 1,
        avg_participation: Math.floor(Math.random() * 30) + 70
      });
    }
    return data;
  }

  generateIntegrationData(): any[] {
    const data = [];
    for (let i = 1; i <= 50; i++) {
      data.push({
        id: i,
        integration_name: `Integration ${i}`,
        type: ['slack', 'teams', 'discord', 'webhook'][Math.floor(Math.random() * 4)],
        messages_sent: Math.floor(Math.random() * 1000) + 100,
        success_rate: Math.floor(Math.random() * 20) + 80,
        last_used: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }
    return data;
  }

  getTableColumns(): any[] {
    switch (this.filters.reportType) {
      case 'user_activity':
        return [
          { key: 'id', label: 'ID' },
          { key: 'username', label: 'Username' },
          { key: 'full_name', label: 'Full Name' },
          { key: 'email', label: 'Email' },
          { key: 'last_login', label: 'Last Login' },
          { key: 'login_count', label: 'Login Count' },
          { key: 'status', label: 'Status' }
        ];
      case 'ceremony_participation':
        return [
          { key: 'id', label: 'ID' },
          { key: 'ceremony_name', label: 'Ceremony Name' },
          { key: 'team', label: 'Team' },
          { key: 'participants', label: 'Participants' },
          { key: 'completion_rate', label: 'Completion Rate' },
          { key: 'date', label: 'Date' }
        ];
      case 'system_performance':
        return [
          { key: 'id', label: 'ID' },
          { key: 'metric', label: 'Metric' },
          { key: 'value', label: 'Value' },
          { key: 'unit', label: 'Unit' },
          { key: 'threshold', label: 'Threshold' },
          { key: 'status', label: 'Status' }
        ];
      case 'team_metrics':
        return [
          { key: 'id', label: 'ID' },
          { key: 'team_name', label: 'Team Name' },
          { key: 'company', label: 'Company' },
          { key: 'members', label: 'Members' },
          { key: 'ceremonies_held', label: 'Ceremonies Held' },
          { key: 'avg_participation', label: 'Avg Participation' }
        ];
      case 'integration_usage':
        return [
          { key: 'id', label: 'ID' },
          { key: 'integration_name', label: 'Integration Name' },
          { key: 'type', label: 'Type' },
          { key: 'messages_sent', label: 'Messages Sent' },
          { key: 'success_rate', label: 'Success Rate' },
          { key: 'last_used', label: 'Last Used' }
        ];
      default:
        return [];
    }
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

  getInsightIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'info': 'info',
      'warning': 'warning',
      'success': 'check_circle',
      'error': 'error'
    };
    return iconMap[type] || 'info';
  }

  refreshData(): void {
    this.generateReport();
  }

  exportData(): void {
    this.snackBar.open('Export functionality will be implemented', 'Close', { duration: 2000 });
  }

  exportTableData(): void {
    this.snackBar.open('Table export functionality will be implemented', 'Close', { duration: 2000 });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  onSortChange(event: any): void {
    console.log('Sort changed:', event);
  }

  viewInsightDetails(insight: any): void {
    this.snackBar.open(`Viewing details for: ${insight.title}`, 'Close', { duration: 2000 });
  }

  dismissInsight(insight: any): void {
    this.reportData.insights = this.reportData.insights.filter((i: any) => i !== insight);
    this.snackBar.open('Insight dismissed', 'Close', { duration: 2000 });
  }
}
