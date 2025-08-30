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
import { AdminService, User, UserCreate, UserUpdate, UserManagementResponse } from '../../../services/admin.service';

@Component({
  selector: 'app-users',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="users-header">
      <div class="header-content">
        <h2>User Management</h2>
        <p>Manage system users, roles, and permissions</p>
      </div>
      <button mat-raised-button color="primary" (click)="openCreateDialog()">
        <mat-icon>add</mat-icon>
        Add User
      </button>
    </div>

    <!-- Filters -->
    <mat-card class="filters-card">
      <mat-card-content>
        <div class="filters-grid">
          <mat-form-field appearance="outline">
            <mat-label>Search</mat-label>
            <input matInput [(ngModel)]="filters.search" placeholder="Search by name, email, or username" (input)="onFilterChange()">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select [(ngModel)]="filters.role" (selectionChange)="onFilterChange()">
              <mat-option value="">All Roles</mat-option>
              <mat-option value="admin">Admin</mat-option>
              <mat-option value="user">User</mat-option>
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

          <mat-form-field appearance="outline">
            <mat-label>Verification</mat-label>
            <mat-select [(ngModel)]="filters.is_verified" (selectionChange)="onFilterChange()">
              <mat-option [value]="undefined">All</mat-option>
              <mat-option [value]="true">Verified</mat-option>
              <mat-option [value]="false">Unverified</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Users Table -->
    <mat-card class="table-card">
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="users" matSort (matSortChange)="onSortChange($event)">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let user">{{ user.id }}</td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="full_name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let user">
                <div class="user-info">
                  <div class="user-name">{{ user.full_name }}</div>
                  <div class="user-email">{{ user.email }}</div>
                  <div class="user-username" *ngIf="user.username">@{{ user.username }}</div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [class]="'role-' + user.role">
                  {{ user.role | titlecase }}
                </span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <div class="status-indicators">
                  <span class="status-badge" [class]="user.is_active ? 'active' : 'inactive'">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="status-badge" [class]="user.is_verified ? 'verified' : 'unverified'">
                    {{ user.is_verified ? 'Verified' : 'Unverified' }}
                  </span>
                </div>
              </td>
            </ng-container>

            <!-- Company Column -->
            <ng-container matColumnDef="company_id">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let user">
                <span class="company-id">ID: {{ user.company_id }}</span>
              </td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="created_at">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
              <td mat-cell *matCellDef="let user">
                {{ user.created_at | date:'short' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let user">
                <div class="action-buttons">
                  <button mat-icon-button matTooltip="Edit User" (click)="openEditDialog(user)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="View Details" (click)="viewUser(user)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    [matTooltip]="user.is_active ? 'Deactivate User' : 'Activate User'"
                    (click)="toggleUserStatus(user)"
                    [color]="user.is_active ? 'warn' : 'primary'"
                  >
                    <mat-icon>{{ user.is_active ? 'block' : 'check_circle' }}</mat-icon>
                  </button>
                  <button 
                    mat-icon-button 
                    color="warn" 
                    matTooltip="Delete User"
                    (click)="deleteUser(user)"
                    [disabled]="user.role === 'admin'"
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
            <p>Loading users...</p>
          </div>

          <!-- No Data State -->
          <div class="no-data-container" *ngIf="!loading && users.length === 0">
            <mat-icon>people_outline</mat-icon>
            <p>No users found</p>
            <button mat-raised-button color="primary" (click)="openCreateDialog()">
              Add First User
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

    <!-- Create/Edit User Dialog -->
    <div class="dialog-container">
      <!-- This will be replaced by actual dialog component -->
    </div>
  `,
  styles: [`
    .users-header {
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

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-weight: 500;
      color: #333;
    }

    .user-email {
      font-size: 0.875rem;
      color: #666;
    }

    .user-username {
      font-size: 0.75rem;
      color: #999;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
    }

    .role-admin {
      background-color: #ff9800;
    }

    .role-user {
      background-color: #2196f3;
    }

    .status-indicators {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .status-badge {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 0.7rem;
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

    .status-badge.verified {
      background-color: #2196f3;
    }

    .status-badge.unverified {
      background-color: #ff9800;
    }

    .company-id {
      font-size: 0.875rem;
      color: #666;
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
      .users-header {
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
    }
  `]
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  users: User[] = [];
  displayedColumns: string[] = ['id', 'full_name', 'role', 'status', 'company_id', 'created_at', 'actions'];
  
  loading = false;
  totalCount = 0;
  pageSize = 25;
  currentPage = 0;
  
  filters = {
    search: '',
    role: '',
    is_active: undefined as boolean | undefined,
    is_verified: undefined as boolean | undefined
  };

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const skip = this.currentPage * this.pageSize;
    
    this.adminService.getUsers(
      skip,
      this.pageSize,
      undefined, // company_id - could be added as a filter
      this.filters.role || undefined,
      this.filters.is_active,
      this.filters.is_verified,
      this.filters.search || undefined
    ).subscribe({
      next: (response: UserManagementResponse) => {
        this.users = response.users;
        this.totalCount = response.total_count;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadUsers();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(event: any): void {
    // Implement sorting logic if needed
    console.log('Sort changed:', event);
  }

  openCreateDialog(): void {
    // TODO: Implement create user dialog
    this.snackBar.open('Create user dialog will be implemented', 'Close', { duration: 2000 });
  }

  openEditDialog(user: User): void {
    // TODO: Implement edit user dialog
    this.snackBar.open(`Edit user dialog for ${user.full_name} will be implemented`, 'Close', { duration: 2000 });
  }

  viewUser(user: User): void {
    // TODO: Implement view user dialog
    this.snackBar.open(`View user details for ${user.full_name} will be implemented`, 'Close', { duration: 2000 });
  }

  toggleUserStatus(user: User): void {
    const action = user.is_active ? 'deactivate' : 'activate';
    const actionText = user.is_active ? 'deactivating' : 'activating';
    
    if (confirm(`Are you sure you want to ${action} ${user.full_name}?`)) {
      if (user.is_active) {
        // Deactivate user
        this.adminService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open(`User ${user.full_name} deactivated successfully`, 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error deactivating user:', error);
            this.snackBar.open('Error deactivating user', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Activate user
        this.adminService.activateUser(user.id).subscribe({
          next: () => {
            this.snackBar.open(`User ${user.full_name} activated successfully`, 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error activating user:', error);
            this.snackBar.open('Error activating user', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteUser(user: User): void {
    if (user.role === 'admin') {
      this.snackBar.open('Cannot delete admin users', 'Close', { duration: 3000 });
      return;
    }

    if (confirm(`Are you sure you want to permanently delete ${user.full_name}? This action cannot be undone.`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open(`User ${user.full_name} deleted successfully`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
