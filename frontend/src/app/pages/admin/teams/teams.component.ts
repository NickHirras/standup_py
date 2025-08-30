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
import { AdminService, Team, TeamCreate, TeamUpdate, TeamManagementResponse } from '../../../services/admin.service';

@Component({
  selector: 'app-teams',
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
    <div class="teams-header">
      <div class="header-content">
        <h2>Team Management</h2>
        <p>Manage teams, members, and team hierarchies</p>
      </div>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>group_add</mat-icon>
        Add Team
      </button>
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="filters.search" placeholder="Search by team name or description" (input)="onFilterChange()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Company</mat-label>
            <mat-select [(ngModel)]="filters.company_id" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All Companies</mat-option>
              <mat-option *ngFor="let company of companies" [value]="company.id">
                {{ company.name }}
              </mat-option>
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

    <!-- Teams Table -->
    <mat-card class="table-card">
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="teams" matSort (matSortChange)="onSortChange($event)">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let team">{{ team.id }}</td>
            </ng-container>

            <!-- Team Info Column -->
            <ng-container matColumnDef="team_info">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Team Information</th>
              <td mat-cell *matCellDef="let team">
                <div class="team-info">
                  <div class="team-name">{{ team.name }}</div>
                  <div class="team-description" *ngIf="team.description">{{ team.description }}</div>
                  <div class="team-company">
                    <mat-icon>business</mat-icon>
                    <span>{{ getCompanyName(team.company_id) }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Members Column -->
            <ng-container matColumnDef="members">
              <th mat-header-cell *matHeaderCellDef>Members</th>
              <td mat-cell *matCellDef="let team">
                <div class="members-info">
                  <div class="member-count">
                    <mat-icon>people</mat-icon>
                    <span>{{ team.member_count || 0 }} members</span>
                  </div>
                  <div class="manager-count" *ngIf="team.manager_count && team.manager_count > 0">
                    <mat-icon>admin_panel_settings</mat-icon>
                    <span>{{ team.manager_count }} managers</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Schedule Column -->
            <ng-container matColumnDef="schedule">
              <th mat-header-cell *matHeaderCellDef>Work Schedule</th>
              <td mat-cell *matCellDef="let team">
                <div class="schedule-info" *ngIf="team.work_schedule_id">
                  <mat-icon>schedule</mat-icon>
                  <span>Schedule #{{ team.work_schedule_id }}</span>
                </div>
                <span class="no-schedule" *ngIf="!team.work_schedule_id">No schedule</span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let team">
                <span class="status-badge" [class]="team.is_active ? 'active' : 'inactive'">
                  {{ team.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let team">
                {{ team.created_at | date:'short' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let team">
                <div class="action-buttons">
                  <button mat-icon-button matTooltip="Edit Team" (click)="openEditDialog(team)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="View Team Details" (click)="viewTeam(team)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Manage Members" (click)="manageMembers(team)">
                    <mat-icon>manage_accounts</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    [matTooltip]="team.is_active ? 'Deactivate Team' : 'Activate Team'"
                    (click)="toggleTeamStatus(team)"
                    [color]="team.is_active ? 'warn' : 'primary'"
                  >
                    <mat-icon>{{ team.is_active ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    matTooltip="Delete Team"
                    (click)="deleteTeam(team)"
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
            <p>Loading teams...</p>
          </div>

          <!-- No Data State -->
          <div class="no-data-container" *ngIf="!loading && teams.length === 0">
            <mat-icon>groups_outline</mat-icon>
            <p>No teams found</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              Add First Team
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

    <!-- Create/Edit Team Dialog -->
    <div class="dialog-container">
      <!-- This will be replaced by actual dialog component -->
    </div>
  `,
  styles: [`
    .teams-header {
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

    .team-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .team-name {
      font-weight: 500;
      color: #333;
      font-size: 1rem;
    }

    .team-description {
      font-size: 0.875rem;
      color: #666;
      font-style: italic;
    }

    .team-company {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .team-company mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .members-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .member-count, .manager-count {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .member-count mat-icon, .manager-count mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .schedule-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: #666;
    }

    .schedule-info mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #999;
    }

    .no-schedule {
      font-size: 0.875rem;
      color: #999;
      font-style: italic;
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
      .teams-header {
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

      .team-info, .members-info {
        min-width: 200px;
      }
    }
  `]
})
export class TeamsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  teams: Team[] = [];
  companies: any[] = []; // Will be populated from companies endpoint
  displayedColumns: string[] = ['id', 'team_info', 'members', 'schedule', 'status', 'created_at', 'actions'];
  
  loading = false;
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;
  
  filters = {
    search: '',
    company_id: undefined as number | undefined,
    is_active: undefined as boolean | undefined
  };

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTeams();
    this.loadCompanies();
  }

  loadTeams(): void {
    this.loading = true;
    const skip = this.currentPage * this.pageSize;
    
    this.adminService.getTeams(
      skip,
      this.pageSize,
      this.filters.company_id,
      this.filters.is_active,
      this.filters.search || undefined
    ).subscribe({
      next: (response: TeamManagementResponse) => {
        this.teams = response.teams;
        this.totalCount = response.total_count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.loading = false;
        this.snackBar.open('Error loading teams', 'Close', { duration: 3000 });
      }
    });
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

  getCompanyName(companyId: number): string {
    const company = this.companies.find(c => c.id === companyId);
    return company ? company.name : `Company #${companyId}`;
  }

  onFilterChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadTeams();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTeams();
  }

  onSortChange(event: any): void {
    // Implement sorting logic if needed
    console.log('Sort changed:', event);
  }

  openCreateDialog(): void {
    // TODO: Implement create team dialog
    this.snackBar.open('Create team dialog will be implemented', 'Close', { duration: 2000 });
  }

  openEditDialog(team: Team): void {
    // TODO: Implement edit team dialog
    this.snackBar.open(`Edit team dialog for ${team.name} will be implemented`, 'Close', { duration: 2000 });
  }

  viewTeam(team: Team): void {
    // TODO: Implement view team dialog
    this.snackBar.open(`View team details for ${team.name} will be implemented`, 'Close', { duration: 2000 });
  }

  manageMembers(team: Team): void {
    // TODO: Implement manage team members dialog
    this.snackBar.open(`Manage members for ${team.name} will be implemented`, 'Close', { duration: 2000 });
  }

  toggleTeamStatus(team: Team): void {
    const action = team.is_active ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${action} ${team.name}?`)) {
      const updateData: TeamUpdate = {
        is_active: !team.is_active
      };

      this.adminService.updateTeam(team.id, updateData).subscribe({
        next: () => {
          this.snackBar.open(`Team ${team.name} ${action}d successfully`, 'Close', { duration: 3000 });
          this.loadTeams();
        },
        error: (error) => {
          console.error(`Error ${action}ing team:`, error);
          this.snackBar.open(`Error ${action}ing team`, 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteTeam(team: Team): void {
    if (confirm(`Are you sure you want to permanently delete ${team.name}? This action cannot be undone.`)) {
      this.adminService.deleteTeam(team.id).subscribe({
        next: () => {
          this.snackBar.open(`Team ${team.name} deleted successfully`, 'Close', { duration: 3000 });
          this.loadTeams();
        },
        error: (error) => {
          console.error('Error deleting team:', error);
          this.snackBar.open('Error deleting team', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
