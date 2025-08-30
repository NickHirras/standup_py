import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Company Settings</mat-card-title>
        <mat-card-subtitle>Configure company information and settings</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Company settings interface will be implemented here.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class CompaniesComponent {}
