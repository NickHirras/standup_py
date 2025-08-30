import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { AdminService, Integration, IntegrationCreate, IntegrationUpdate, IntegrationManagementResponse } from '../../../services/admin.service';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  template: `
    <div class="integrations-header">
      <div class="header-content">
        <h2>Integration Management</h2>
        <p>Manage chat integrations and external service connections</p>
      </div>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add_link</mat-icon>
        Add Integration
      </button>
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="filters.search" placeholder="Search by name or description" (input)="onFilterChange()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Integration Type</mat-label>
            <mat-select [(ngModel)]="filters.integration_type" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All Types</mat-option>
              <mat-option value="slack">Slack</mat-option>
              <mat-option value="teams">Microsoft Teams</mat-option>
              <mat-option value="discord">Discord</mat-option>
              <mat-option value="webhook">Webhook</mat-option>
              <mat-option value="email">Email</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.is_active" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All Status</mat-option>
              <mat-option [value]="true">Active</mat-option>
              <mat-option [value]="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Integrations Table -->
    <mat-card class="table-card">
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="integrations" matSort (matSortChange)="onSortChange($event)">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let integration">{{ integration.id }}</td>
            </ng-container>

            <!-- Integration Info Column -->
            <ng-container matColumnDef="integration_info">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Integration Details</th>
              <td mat-cell *matCellDef="let integration">
                <div class="integration-info">
                  <div class="integration-name">{{ integration.name }}</div>
                  <div class="integration-description" *ngIf="integration.description">{{ integration.description }}</div>
                  <div class="integration-type">
                    <mat-icon [class]="getIntegrationTypeIcon(integration.integration_type)"></mat-icon>
                    <span class="type-badge" [class]="integration.integration_type">
                      {{ integration.integration_type | titlecase }}
                    </span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Configuration Column -->
            <ng-container matColumnDef="configuration">
              <th mat-header-cell *matHeaderCellDef>Configuration</th>
              <td mat-cell *matCellDef="let integration">
                <div class="configuration-info">
                  <div class="config-item" *ngIf="integration.webhook_url">
                    <mat-icon>link</mat-icon>
                    <span class="config-value">{{ integration.webhook_url }}</span>
                  </div>
                  <div class="config-item" *ngIf="integration.channel_id">
                    <mat-icon>tag</mat-icon>
                    <span class="config-value">Channel: {{ integration.channel_id }}</span>
                  </div>
                  <div class="config-item" *ngIf="integration.api_key">
                    <mat-icon>vpn_key</mat-icon>
                    <span class="config-value">API Key: {{ integration.api_key | slice:0:8 }}...</span>
                  </div>
                  <div class="config-item" *ngIf="integration.team_id">
                    <mat-icon>business</mat-icon>
                    <span class="config-value">Team: {{ integration.team_id }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let integration">
                <div class="status-info">
                  <span class="status-badge" [class]="integration.is_active ? 'active' : 'inactive'">
                    {{ integration.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <div class="connection-status" *ngIf="integration.last_connection_status">
                    <mat-icon [class]="integration.last_connection_status === 'success' ? 'check_circle' : 'error'">
                      {{ integration.last_connection_status === 'success' ? 'check_circle' : 'error' }}
                    </mat-icon>
                    <span [class]="integration.last_connection_status === 'success' ? 'success' : 'error'">
                      {{ integration.last_connection_status === 'success' ? 'Connected' : 'Failed' }}
                    </span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Last Activity Column -->
            <ng-container matColumnDef="last_activity">
              <th mat-header-cell *matHeaderCellDef>Last Activity</th>
              <td mat-cell *matCellDef="let integration">
                <div class="activity-info">
                  <div class="last-connection" *ngIf="integration.last_connection_at">
                    <mat-icon>schedule</mat-icon>
                    <span>{{ integration.last_connection_at | date:'short' }}</span>
                  </div>
                  <div class="message-count" *ngIf="integration.message_count">
                    <mat-icon>message</mat-icon>
                    <span>{{ integration.message_count }} messages</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let integration">
                {{ integration.created_at | date:'short' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let integration">
                <div class="action-buttons">
                  <button mat-icon-button matTooltip="Edit Integration" (click)="openEditDialog(integration)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="View Integration Details" (click)="viewIntegration(integration)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Test Connection" (click)="testConnection(integration)">
                    <mat-icon>wifi_tethering</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    [matTooltip]="integration.is_active ? 'Deactivate Integration' : 'Activate Integration'"
                    (click)="toggleIntegrationStatus(integration)"
                    [color]="integration.is_active ? 'warn' : 'primary'"
                  >
                    <mat-icon>{{ integration.is_active ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    matTooltip="Delete Integration"
                    (click)="deleteIntegration(integration)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <!-- Loading State -->
          <div class="loading-container" *ngIf="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading integrations...</p>
          </div>

          <!-- No Data State -->
          <div class="no-data-container" *ngIf="!loading && integrations.length === 0">
            <mat-icon>integration_instructions</mat-icon>
            <p>No integrations found</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              Add First Integration
            </button>
          </div>

          <!-- Pagination -->
          <mat-paginator 
            [length]="totalCount" 
            [pageSize]="pageSize" 
            [pageSizeOptions]="[10, 25, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons
          ></mat-paginator>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Create/Edit Integration Dialog -->
    <div class="dialog-container">
      <!-- This will be replaced by actual dialog component -->
    </div>
  `,
  styles: [`
    .integrations-header {
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

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .table-card {
      margin-bottom: 24px;
    }

    .table-container {
      position: relative;
      min-height: 400px;
    }

    table {
      width: 100%;
    }

    .integration-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .integration-name {
      font-weight: 500;
      color: #333;
      font-size: 1rem;
    }

    .integration-description {
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    .integration-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }

    .integration-type mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }

    .type-badge {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
    }

    .type-badge.slack {
      background-color: #4a154b;
    }

    .type-badge.teams {
      background-color: #6264a7;
    }

    .type-badge.discord {
      background-color: #5865f2;
    }

    .type-badge.webhook {
      background-color: #ff6b6b;
    }

    .type-badge.email {
      background-color: #4caf50;
    }

    .configuration-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .config-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .config-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .config-value {
      font-family: monospace;
      font-size: 0.8rem;
      color: #333;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      text-align: center;
    }

    .status-badge.active {
      background-color: #4caf50;
    }

    .status-badge.inactive {
      background-color: #f44336;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
    }

    .connection-status mat-icon {
      font-size: 0.875rem;
      width: 0.875rem;
      height: 0.875rem;
    }

    .connection-status .success {
      color: #4caf50;
    }

    .connection-status .error {
      color: #f44336;
    }

    .activity-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .last-connection, .message-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .last-connection mat-icon, .message-count mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
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

    /* Responsive Design */
    @media (max-width: 768px) {
      .integrations-header {
        flex-direction: column;
        gap: 16px;
      }

      .filters-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        gap: 2px;
      }

      .table-container {
        overflow-x: auto;
      }

      .integration-info, .configuration-info {
        min-width: 200px;
      }
    }
  `]
})
export class IntegrationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  integrations: Integration[] = [];
  displayedColumns: string[] = ['id', 'integration_info', 'configuration', 'status', 'last_activity', 'created_at', 'actions'];
  
  loading = false;
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;
  
  filters = {
    search: '',
    integration_type: undefined as string | undefined,
    is_active: undefined as boolean | undefined
  };

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadIntegrations();
  }

  loadIntegrations(): void {
    this.loading = true;
    const skip = this.currentPage * this.pageSize;
    
    this.adminService.getIntegrations(
      skip,
      this.pageSize,
      this.filters.integration_type,
      this.filters.is_active,
      this.filters.search || undefined
    ).subscribe({
      next: (response: IntegrationManagementResponse) => {
        this.integrations = response.integrations;
        this.totalCount = response.total_count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading integrations:', error);
        this.loading = false;
        this.snackBar.open('Error loading integrations', 'Close', { duration: 3000 });
      }
    });
  }

  getIntegrationTypeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'slack': 'chat',
      'teams': 'groups',
      'discord': 'forum',
      'webhook': 'webhook',
      'email': 'email'
    };
    return iconMap[type] || 'link';
  }

  onFilterChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadIntegrations();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadIntegrations();
  }

  onSortChange(event: any): void {
    // Implement sorting logic if needed
    console.log('Sort changed:', event);
  }

  openCreateDialog(): void {
    // TODO: Implement create integration dialog
    this.snackBar.open('Create integration dialog will be implemented', 'Close', { duration: 2000 });
  }

  openEditDialog(integration: Integration): void {
    // TODO: Implement edit integration dialog
    this.snackBar.open(`Edit integration dialog for ${integration.name} will be implemented`, 'Close', { duration: 2000 });
  }

  viewIntegration(integration: Integration): void {
    // TODO: Implement view integration dialog
    this.snackBar.open(`View integration details for ${integration.name} will be implemented`, 'Close', { duration: 2000 });
  }

  testConnection(integration: Integration): void {
    // TODO: Implement test connection functionality
    this.snackBar.open(`Testing connection for ${integration.name}...`, 'Close', { duration: 2000 });
  }

  toggleIntegrationStatus(integration: Integration): void {
    const action = integration.is_active ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${action} ${integration.name}?`)) {
      const updateData: IntegrationUpdate = {
        is_active: !integration.is_active
      };

      this.adminService.updateIntegration(integration.id, updateData).subscribe({
        next: () => {
          this.snackBar.open(`Integration ${integration.name} ${action}d successfully`, 'Close', { duration: 3000 });
          this.loadIntegrations();
        },
        error: (error) => {
          console.error(`Error ${action}ing integration:`, error);
          this.snackBar.open(`Error ${action}ing integration`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteIntegration(integration: Integration): void {
    if (confirm(`Are you sure you want to permanently delete ${integration.name}? This action cannot be undone.`)) {
      this.adminService.deleteIntegration(integration.id).subscribe({
        next: () => {
          this.snackBar.open(`Integration ${integration.name} deleted successfully`, 'Close', { duration: 3000 });
          this.loadIntegrations();
        },
        error: (error) => {
          console.error('Error deleting integration:', error);
          this.snackBar.open('Error deleting integration', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
