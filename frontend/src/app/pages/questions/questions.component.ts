import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-questions',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Questions Management</mat-card-title>
        <mat-card-subtitle>Manage ceremony questions and templates</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Questions management interface will be implemented here.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class QuestionsComponent {}
