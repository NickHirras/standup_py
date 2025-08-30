import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-integrations',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Chat Integrations</mat-card-title>
        <mat-card-subtitle>Configure Slack, Google Chat, and Microsoft Teams</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>Chat integrations interface will be implemented here.</p>
      </mat-card-content>
    </mat-card>
  `
})
export class IntegrationsComponent {}
