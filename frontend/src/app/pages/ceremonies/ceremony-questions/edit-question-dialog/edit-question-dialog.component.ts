import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { CeremoniesService, Question, CeremonyQuestion, CeremonyQuestionCreate } from '../../../../services/ceremonies.service';

export interface EditQuestionDialogData {
  ceremonyId: number;
  ceremonyQuestion: CeremonyQuestion;
  question: Question;
}

@Component({
  selector: 'app-edit-question-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>edit</mat-icon>
      Edit Question Settings
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-question-form">
        <!-- Question Preview Card -->
        <mat-card class="question-preview-card">
          <mat-card-header>
            <mat-card-title>Question Preview</mat-card-title>
            <mat-card-subtitle>{{ data.question.question_type.replace('_', ' ') | titlecase }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="question-text">{{ data.question.text }}</p>
            <div class="question-meta">
              <mat-chip *ngIf="data.question.help_text" color="accent" selected>
                <mat-icon>help</mat-icon>
                {{ data.question.help_text }}
              </mat-chip>
              <mat-chip *ngIf="data.question.options && data.question.options.length > 0" color="primary" selected>
                <mat-icon>list</mat-icon>
                {{ data.question.options.length }} options
              </mat-chip>
              <mat-chip *ngIf="data.question.min_value && data.question.max_value" color="warn" selected>
                <mat-icon>linear_scale</mat-icon>
                {{ data.question.min_value }} - {{ data.question.max_value }}
              </mat-chip>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Editable Settings -->
        <div class="settings-section">
          <h3>Ceremony Settings</h3>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Order Index</mat-label>
            <input matInput type="number" formControlName="order_index" 
                   placeholder="Position in the ceremony (0 = first)">
            <mat-hint>Lower numbers appear first in the ceremony</mat-hint>
            <mat-error *ngIf="form.get('order_index')?.hasError('required')">
              Order index is required
            </mat-error>
          </mat-form-field>
          
          <div class="checkbox-field">
            <mat-checkbox formControlName="is_required" color="primary">
              Question is required
            </mat-checkbox>
            <p class="hint-text">
              Required questions must be answered before the ceremony can be completed
            </p>
          </div>
        </div>

        <!-- Question Type Specific Settings -->
        <div class="settings-section" *ngIf="showAdvancedSettings">
          <h3>Advanced Settings</h3>
          
          <!-- Linear Scale Settings -->
          <div *ngIf="data.question.question_type === 'linear_scale'" class="advanced-settings">
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Minimum Value</mat-label>
                <input matInput type="number" formControlName="min_value" 
                       placeholder="e.g., 1">
                <mat-hint>Lowest value on the scale</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Maximum Value</mat-label>
                <input matInput type="number" formControlName="max_value" 
                       placeholder="e.g., 10">
                <mat-hint>Highest value on the scale</mat-hint>
              </mat-form-field>
            </div>
            
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Minimum Label</mat-label>
                <input matInput formControlName="min_label" 
                       placeholder="e.g., Poor">
                <mat-hint>Label for the minimum value</mat-hint>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Maximum Label</mat-label>
                <input matInput formControlName="max_label" 
                       placeholder="e.g., Excellent">
                <mat-hint>Label for the maximum value</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <!-- File Upload Settings -->
          <div *ngIf="data.question.question_type === 'file_upload'" class="advanced-settings">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Allowed File Types</mat-label>
              <input matInput formControlName="allowed_file_types" 
                     placeholder="e.g., .pdf, .doc, .txt">
              <mat-hint>Comma-separated list of allowed file extensions</mat-hint>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Maximum File Size (MB)</mat-label>
              <input matInput type="number" formControlName="max_file_size_mb" 
                     placeholder="e.g., 10">
              <mat-hint>Maximum file size in megabytes</mat-hint>
            </mat-form-field>
          </div>

          <!-- Help Text -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Help Text</mat-label>
            <textarea matInput formControlName="help_text" 
                      placeholder="Additional guidance for users answering this question"
                      rows="3"></textarea>
            <mat-hint>Optional help text to guide users</mat-hint>
          </mat-form-field>
        </div>

        <!-- Toggle Advanced Settings -->
        <div class="advanced-toggle">
          <button mat-button type="button" (click)="toggleAdvancedSettings()" color="primary">
            <mat-icon>{{ showAdvancedSettings ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showAdvancedSettings ? 'Hide' : 'Show' }} Advanced Settings
          </button>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || loading"
              (click)="onSubmit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Update Question</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-question-form {
      min-width: 500px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .half-width {
      width: calc(50% - 8px);
      margin-bottom: 16px;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .settings-section {
      margin-bottom: 24px;
    }
    
    .settings-section h3 {
      margin: 0 0 16px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-medium-size);
      font-weight: 500;
    }
    
    .question-preview-card {
      margin-bottom: 24px;
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    .question-text {
      font-size: var(--md-sys-typescale-body-large-size);
      color: var(--md-sys-color-on-surface);
      margin: 8px 0;
      line-height: 1.5;
    }
    
    .question-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    
    .checkbox-field {
      margin-bottom: 16px;
    }
    
    .hint-text {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 4px;
      margin-left: 8px;
      line-height: 1.4;
    }
    
    .advanced-settings {
      margin-bottom: 16px;
    }
    
    .advanced-toggle {
      text-align: center;
      margin: 16px 0;
    }
    
    .advanced-toggle button {
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
    
    mat-dialog-actions button {
      min-width: 100px;
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    @media (max-width: 600px) {
      .edit-question-form {
        min-width: 300px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class EditQuestionDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  showAdvancedSettings = false;

  constructor(
    private fb: FormBuilder,
    private ceremoniesService: CeremoniesService,
    private dialogRef: MatDialogRef<EditQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditQuestionDialogData,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      order_index: [0, Validators.required],
      is_required: [true],
      help_text: [''],
      min_value: [null],
      max_value: [null],
      min_label: [''],
      max_label: [''],
      allowed_file_types: [''],
      max_file_size_mb: [null]
    });
  }

  ngOnInit(): void {
    // Initialize form with current values
    this.form.patchValue({
      order_index: this.data.ceremonyQuestion.order_index,
      is_required: this.data.ceremonyQuestion.is_required,
      help_text: this.data.question.help_text || '',
      min_value: this.data.question.min_value || null,
      max_value: this.data.question.max_value || null,
      min_label: this.data.question.min_label || '',
      max_label: this.data.question.max_label || '',
      allowed_file_types: this.data.question.allowed_file_types ? 
        this.data.question.allowed_file_types.join(', ') : '',
      max_file_size_mb: this.data.question.max_file_size ? 
        Math.round(this.data.question.max_file_size / (1024 * 1024)) : null
    });

    // Add validators for specific question types
    this.setupQuestionTypeValidators();
  }

  private setupQuestionTypeValidators(): void {
    if (this.data.question.question_type === 'linear_scale') {
      this.form.get('min_value')?.setValidators([Validators.required, Validators.min(0)]);
      this.form.get('max_value')?.setValidators([Validators.required, Validators.min(1)]);
      
      // Custom validator to ensure max > min
      this.form.get('max_value')?.valueChanges.subscribe(maxVal => {
        const minVal = this.form.get('min_value')?.value;
        if (minVal !== null && maxVal !== null && maxVal <= minVal) {
          this.form.get('max_value')?.setErrors({ invalidRange: true });
        } else {
          this.form.get('max_value')?.setErrors(null);
        }
      });
    }

    if (this.data.question.question_type === 'file_upload') {
      this.form.get('allowed_file_types')?.setValidators([Validators.required]);
      this.form.get('max_file_size_mb')?.setValidators([Validators.required, Validators.min(1)]);
    }
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      
      const formValue = this.form.value;
      
      // Prepare the data for updating the ceremony question
      const ceremonyQuestionData: CeremonyQuestionCreate = {
        ceremony_id: this.data.ceremonyId,
        question_id: this.data.ceremonyQuestion.question_id,
        order_index: formValue.order_index,
        is_required: formValue.is_required
      };

      // Prepare the data for updating the question itself (if advanced settings changed)
      let questionUpdateData: any = null;
      if (this.showAdvancedSettings) {
        questionUpdateData = {
          help_text: formValue.help_text || null,
          min_value: formValue.min_value || null,
          max_value: formValue.max_value || null,
          min_label: formValue.min_label || null,
          max_label: formValue.max_label || null,
          allowed_file_types: formValue.allowed_file_types ? 
            formValue.allowed_file_types.split(',').map((t: string) => t.trim()) : null,
          max_file_size: formValue.max_file_size_mb ? 
            formValue.max_file_size_mb * 1024 * 1024 : null
        };
      }

      // Update ceremony question settings
      this.ceremoniesService.updateCeremonyQuestion(
        this.data.ceremonyId,
        this.data.ceremonyQuestion.question_id,
        ceremonyQuestionData
      ).subscribe({
        next: (ceremonyQuestionResponse) => {
          // If we have question updates, update the question as well
          if (questionUpdateData) {
            this.ceremoniesService.updateQuestion(
              this.data.question.id,
              questionUpdateData
            ).subscribe({
              next: (questionResponse) => {
                this.loading = false;
                this.snackBar.open('Question updated successfully!', 'Close', { duration: 3000 });
                this.dialogRef.close({
                  ceremonyQuestion: ceremonyQuestionResponse,
                  question: questionResponse
                });
              },
              error: (error) => {
                this.loading = false;
                console.error('Error updating question:', error);
                const errorMessage = error.error?.detail || error.message || 'Failed to update question';
                this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
              }
            });
          } else {
            this.loading = false;
            this.snackBar.open('Question settings updated successfully!', 'Close', { duration: 3000 });
            this.dialogRef.close({
              ceremonyQuestion: ceremonyQuestionResponse,
              question: this.data.question
            });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error updating ceremony question:', error);
          const errorMessage = error.error?.detail || error.message || 'Failed to update question settings';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
