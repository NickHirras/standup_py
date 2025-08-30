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
import { CeremoniesService, Question, CeremonyQuestionCreate } from '../../../../services/ceremonies.service';

export interface AddQuestionDialogData {
  ceremonyId: number;
  availableQuestions: Question[];
  existingQuestionIds: number[];
}

@Component({
  selector: 'app-add-question-dialog',
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
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add</mat-icon>
      Add Question to Ceremony
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="add-question-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Select Question</mat-label>
          <mat-select formControlName="question_id" required>
            <mat-option *ngFor="let question of availableQuestions" 
                        [value]="question.id"
                        [disabled]="existingQuestionIds.includes(question.id)">
              {{ question.text }}
              <span class="question-type">({{ question.question_type.replace('_', ' ') }})</span>
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('question_id')?.hasError('required')">
            Please select a question
          </mat-error>
        </mat-form-field>
        
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
        
        <div class="selected-question-preview" *ngIf="selectedQuestion">
          <h4>Question Preview:</h4>
          <div class="question-preview">
            <p><strong>Text:</strong> {{ selectedQuestion.text }}</p>
            <p><strong>Type:</strong> {{ selectedQuestion.question_type.replace('_', ' ') }}</p>
            <p *ngIf="selectedQuestion.help_text"><strong>Help:</strong> {{ selectedQuestion.help_text }}</p>
            <p *ngIf="selectedQuestion.options && selectedQuestion.options.length > 0">
              <strong>Options:</strong> {{ selectedQuestion.options.length }} choices
            </p>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || loading"
              (click)="onSubmit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Add Question</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-question-form {
      min-width: 400px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .checkbox-field {
      margin-bottom: 16px;
    }
    
    .hint-text {
      font-size: 0.875rem;
      color: #666;
      margin-top: 4px;
      margin-left: 8px;
    }
    
    .selected-question-preview {
      margin-top: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    .selected-question-preview h4 {
      margin: 0 0 12px 0;
      color: #333;
    }
    
    .question-preview p {
      margin: 4px 0;
      font-size: 0.875rem;
    }
    
    .question-type {
      color: #666;
      font-style: italic;
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
    
    mat-dialog-actions button {
      min-width: 100px;
    }
    
    @media (max-width: 600px) {
      .add-question-form {
        min-width: 300px;
      }
    }
  `]
})
export class AddQuestionDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  selectedQuestion: Question | null = null;

  constructor(
    private fb: FormBuilder,
    private ceremoniesService: CeremoniesService,
    private dialogRef: MatDialogRef<AddQuestionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddQuestionDialogData,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      question_id: ['', Validators.required],
      order_index: [0, Validators.required],
      is_required: [true]
    });
  }

  ngOnInit(): void {
    // Watch for question selection changes to show preview
    this.form.get('question_id')?.valueChanges.subscribe(questionId => {
      if (questionId) {
        this.selectedQuestion = this.data.availableQuestions.find(q => q.id === questionId) || null;
      } else {
        this.selectedQuestion = null;
      }
    });
  }

  get availableQuestions(): Question[] {
    return this.data.availableQuestions.filter(q => 
      !this.data.existingQuestionIds.includes(q.id)
    );
  }

  get existingQuestionIds(): number[] {
    return this.data.existingQuestionIds;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      
      const questionData: CeremonyQuestionCreate = {
        ceremony_id: this.data.ceremonyId,
        question_id: this.form.value.question_id,
        order_index: this.form.value.order_index,
        is_required: this.form.value.is_required
      };

      this.ceremoniesService.addQuestionToCeremony(
        this.data.ceremonyId, 
        questionData
      ).subscribe({
        next: (response) => {
          this.loading = false;
          this.snackBar.open('Question added successfully!', 'Close', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.loading = false;
          console.error('Error adding question:', error);
          const errorMessage = error.error?.detail || error.message || 'Failed to add question';
          this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        }
      });
    }
  }
}
