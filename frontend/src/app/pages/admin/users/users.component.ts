import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>User Management</mat-card-title>
        <mat-card-subtitle>Manage company users and permissions</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>User management interface will be implemented here.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class UsersComponent {}
