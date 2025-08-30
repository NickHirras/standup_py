import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService, User } from './services/auth.service';
import { Subscription } from 'rxjs';

// Search option interface
interface SearchOption {
  value: string;
  title: string;
  subtitle: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  template: `
    <mat-toolbar color="primary" class="nav-container">
      <div class="nav-toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        
        <div class="app-title">
          <mat-icon class="app-icon">event_note</mat-icon>
          <span class="app-name">Stand-Up</span>
        </div>
        
        <div class="search-container">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search...</mat-label>
            <input matInput 
                   [formControl]="searchControl"
                   placeholder="Search teams, ceremonies, users..."
                   class="search-input">
            <mat-icon matSuffix>search</mat-icon>
            <mat-autocomplete #auto="matAutocomplete" 
                             (optionSelected)="onSearchOptionSelected($event)">
              <mat-option *ngFor="let option of filteredOptions | async" 
                          [value]="option.value">
                <div class="search-option">
                  <mat-icon class="option-icon">{{ option.icon }}</mat-icon>
                  <div class="option-content">
                    <div class="option-title">{{ option.title }}</div>
                    <div class="option-subtitle">{{ option.subtitle }}</div>
                  </div>
                </div>
              </mat-option>
            </mat-autocomplete>
          </mat-form-field>
        </div>
        
        <span class="nav-spacer"></span>
        
        <div *ngIf="currentUser" class="user-info">
          <span class="user-name">{{ currentUser.full_name || currentUser.username }}</span>
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
        </div>
        
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Profile</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="confirmLogout()" class="logout-button">
            <mat-icon>exit_to_app</mat-icon>
            <span>Logout</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          
          <a mat-list-item routerLink="/teams" routerLinkActive="active">
            <mat-icon>group</mat-icon>
            <span>Teams</span>
          </a>
          
          <a mat-list-item routerLink="/ceremonies" routerLinkActive="active">
            <mat-icon>event</mat-icon>
            <span>Ceremonies</span>
          </a>
          
          <mat-divider></mat-divider>
          
          <a mat-list-item routerLink="/admin" routerLinkActive="active" *ngIf="isAdmin">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>Admin</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content class="sidenav-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: calc(100vh - 64px);
    }
    
    .sidenav {
      width: 250px;
      background-color: var(--md-sys-color-surface);
      border-right: 1px solid var(--md-sys-color-outline-variant);
    }
    
    .sidenav-content {
      background-color: var(--md-sys-color-surface);
    }
    
    .mat-nav-list .mat-list-item {
      margin: 4px 8px;
      border-radius: var(--md-sys-shape-corner-medium);
      transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .mat-nav-list .mat-list-item.active {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
    
    .mat-nav-list .mat-list-item:hover:not(.active) {
      background-color: var(--md-sys-color-surface-variant);
    }
    
    .mat-nav-list .mat-list-item mat-icon {
      margin-right: 16px;
    }
    
    .mat-divider {
      margin: 16px 0;
      border-color: var(--md-sys-color-outline-variant);
    }
    
    .nav-toolbar {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 16px;
    }
    
    .nav-spacer {
      flex: 1;
    }
    
    .app-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: 8px;
    }
    
    .app-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .app-name {
      font-size: var(--md-sys-typescale-title-large-size);
      font-weight: 500;
      color: white;
      letter-spacing: 0.1px;
    }
    
    .search-container {
      flex: 1;
      max-width: 500px;
      margin: 0 16px;
    }
    
    .search-field {
      width: 100%;
    }
    
    .search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
    
    .search-field ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: var(--md-sys-shape-corner-extra-large);
      padding: 0 16px;
      transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
    }
    
    .search-field ::ng-deep .mat-mdc-text-field-wrapper:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }
    
    .search-field ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .search-field ::ng-deep .mat-mdc-form-field-label {
      color: rgba(255, 255, 255, 0.8);
      font-size: var(--md-sys-typescale-label-large-size);
    }
    
    .search-field ::ng-deep .mat-mdc-input-element {
      color: white;
      font-size: var(--md-sys-typescale-body-large-size);
    }
    
    .search-field ::ng-deep .mat-mdc-input-element::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .search-field ::ng-deep .mat-icon {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .search-option {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
    }
    
    .option-icon {
      color: var(--md-sys-color-on-surface-variant);
      width: 20px;
      height: 20px;
    }
    
    .option-content {
      display: flex;
      flex-direction: column;
    }
    
    .option-title {
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-body-medium-size);
    }
    
    .option-subtitle {
      font-size: var(--md-sys-typescale-label-medium-size);
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 2px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-name {
      font-size: var(--md-sys-typescale-body-medium-size);
      color: white;
      font-weight: 500;
    }
    
    .logout-button {
      color: var(--md-sys-color-error);
    }
    
    .logout-button mat-icon {
      color: var(--md-sys-color-error);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .search-container {
        max-width: 300px;
        margin: 0 8px;
      }
      
      .app-name {
        font-size: var(--md-sys-typescale-title-medium-size);
      }
      
      .nav-toolbar {
        gap: 12px;
      }
    }
    
    @media (max-width: 600px) {
      .search-container {
        display: none;
      }
      
      .app-title {
        margin-left: 4px;
      }
      
      .app-name {
        font-size: var(--md-sys-typescale-title-small-size);
      }
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isAdmin = false;
  private userSubscription: Subscription;
  
  // Search functionality
  searchControl = new FormControl('');
  filteredOptions: Observable<SearchOption[]> = new Observable();
  
  // Sample search options (in a real app, this would come from a service)
  searchOptions: SearchOption[] = [
    { value: 'teams', title: 'Teams', subtitle: 'Manage team settings', icon: 'group' },
    { value: 'ceremonies', title: 'Ceremonies', subtitle: 'Daily stand-ups and meetings', icon: 'event' },
    { value: 'users', title: 'Users', subtitle: 'User management', icon: 'people' },
    { value: 'dashboard', title: 'Dashboard', subtitle: 'Overview and analytics', icon: 'dashboard' },
    { value: 'admin', title: 'Admin Panel', subtitle: 'System administration', icon: 'admin_panel_settings' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.userSubscription = this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated on app start
    if (this.authService.isAuthenticated() && !this.currentUser) {
      // User has token but no user info, try to get user info
      this.authService.currentUser.subscribe(user => {
        if (user) {
          this.currentUser = user;
          this.isAdmin = this.authService.isAdmin();
        }
      });
    }
    
    // Initialize search functionality
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }
  
  private _filter(value: string): SearchOption[] {
    const filterValue = value.toLowerCase();
    return this.searchOptions.filter(option => 
      option.title.toLowerCase().includes(filterValue) ||
      option.subtitle.toLowerCase().includes(filterValue)
    );
  }
  
  onSearchOptionSelected(event: any): void {
    const selectedValue = event.option.value;
    this.searchControl.setValue('');
    
    // Navigate based on selection
    switch (selectedValue) {
      case 'teams':
        this.router.navigate(['/teams']);
        break;
      case 'ceremonies':
        this.router.navigate(['/ceremonies']);
        break;
      case 'users':
        if (this.isAdmin) {
          this.router.navigate(['/admin/users']);
        }
        break;
      case 'dashboard':
        this.router.navigate(['/dashboard']);
        break;
      case 'admin':
        if (this.isAdmin) {
          this.router.navigate(['/admin']);
        }
        break;
    }
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  confirmLogout(): void {
    const dialogRef = this.dialog.open(LogoutConfirmDialog, {
      width: '400px',
      data: { username: this.currentUser?.full_name || this.currentUser?.username }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.logout();
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.snackBar.open('Successfully logged out', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if backend logout fails, clear local state and redirect
        this.authService.logout().subscribe();
        this.router.navigate(['/login']);
      }
    });
  }
}

// Logout confirmation dialog component
@Component({
  selector: 'app-logout-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">exit_to_app</mat-icon>
      Confirm Logout
    </h2>
    <mat-dialog-content>
      <p>Are you sure you want to logout, <strong>{{ data.username }}</strong>?</p>
      <p>You will need to log in again to access the application.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">
        <mat-icon>exit_to_app</mat-icon>
        Logout
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: var(--md-sys-typescale-headline-small-size);
      font-weight: 400;
      color: var(--md-sys-color-on-surface);
    }
    
    mat-dialog-content {
      margin: 16px 0;
      font-size: var(--md-sys-typescale-body-medium-size);
      color: var(--md-sys-color-on-surface);
      line-height: 1.5;
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
    
    .mat-mdc-dialog-actions button {
      margin-left: 8px;
      border-radius: var(--md-sys-shape-corner-large);
      text-transform: none;
      font-weight: 500;
      letter-spacing: 0.1px;
    }
    
    .mat-mdc-dialog-actions button[color="warn"] {
      background-color: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }
  `]
})
export class LogoutConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<LogoutConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { username: string }
  ) {}
}
