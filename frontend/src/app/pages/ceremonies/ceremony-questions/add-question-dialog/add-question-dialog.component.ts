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
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
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
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add</mat-icon>
      Add Question to Ceremony
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="add-question-form">
        <!-- Mode Selection Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedIndexChange)="onTabChange($event)">
          <!-- Select Existing Question Tab -->
          <mat-tab label="Select Existing Question">
            <div class="tab-content">
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
            </div>
          </mat-tab>
          
          <!-- Create New Question Tab -->
          <mat-tab label="Create New Question">
            <div class="tab-content">
              <!-- Basic Question Settings -->
              <div class="form-section">
                <h4>Question Details</h4>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Question Text</mat-label>
                  <textarea matInput formControlName="new_question_text" 
                            placeholder="Enter your question here..."
                            rows="3" required></textarea>
                  <mat-error *ngIf="form.get('new_question_text')?.hasError('required')">
                    Question text is required
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Question Type</mat-label>
                  <mat-select formControlName="new_question_type" required>
                    <mat-option value="short_answer">Short Answer</mat-option>
                    <mat-option value="paragraph">Paragraph</mat-option>
                    <mat-option value="multiple_choice">Multiple Choice</mat-option>
                    <mat-option value="checkboxes">Checkboxes</mat-option>
                    <mat-option value="dropdown">Dropdown</mat-option>
                    <mat-option value="linear_scale">Linear Scale</mat-option>
                    <mat-option value="date">Date</mat-option>
                    <mat-option value="time">Time</mat-option>
                  </mat-select>
                  <mat-error *ngIf="form.get('new_question_type')?.hasError('required')">
                    Question type is required
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Help Text (Optional)</mat-label>
                  <textarea matInput formControlName="new_help_text" 
                            placeholder="Additional guidance for users..."
                            rows="2"></textarea>
                </mat-form-field>
              </div>
              
              <!-- Question Type Specific Settings -->
              <div class="form-section" *ngIf="showAdvancedSettings">
                <h4>Advanced Settings</h4>
                
                <!-- Multiple Choice/Checkboxes/Dropdown Options -->
                <div *ngIf="['multiple_choice', 'checkboxes', 'dropdown'].includes(form.get('new_question_type')?.value)" 
                     class="options-section">
                  <h5>Answer Options</h5>
                  <div formArrayName="new_options">
                    <div *ngFor="let option of optionsArray.controls; let i = index" 
                         class="option-row" [formGroupName]="i">
                      <mat-form-field appearance="outline" class="option-text">
                        <mat-label>Option {{ i + 1 }}</mat-label>
                        <input matInput formControlName="text" 
                               placeholder="Option text">
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="option-value">
                        <mat-label>Value</mat-label>
                        <input matInput formControlName="value" 
                               placeholder="Option value">
                      </mat-form-field>
                      <button mat-icon-button type="button" 
                              (click)="removeOption(i)" 
                              color="warn"
                              class="remove-option-btn">
                        <mat-icon>remove_circle</mat-icon>
                      </button>
                    </div>
                  </div>
                  <button mat-button type="button" 
                          (click)="addOption()" 
                          color="primary"
                          class="add-option-btn">
                    <mat-icon>add_circle</mat-icon>
                    Add Option
                  </button>
                </div>
                
                <!-- Linear Scale Settings -->
                <div *ngIf="form.get('new_question_type')?.value === 'linear_scale'" class="scale-section">
                  <h5>Scale Configuration</h5>
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Minimum Value</mat-label>
                      <input matInput type="number" formControlName="new_min_value" 
                             placeholder="e.g., 1">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Maximum Value</mat-label>
                      <input matInput type="number" formControlName="new_max_value" 
                             placeholder="e.g., 10">
                    </mat-form-field>
                  </div>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Minimum Label</mat-label>
                      <input matInput formControlName="new_min_label" 
                             placeholder="e.g., Poor">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline" class="half-width">
                      <mat-label>Maximum Label</mat-label>
                      <input matInput formControlName="new_max_label" 
                             placeholder="e.g., Excellent">
                    </mat-form-field>
                  </div>
                </div>
              </div>
              
              <!-- Toggle Advanced Settings -->
              <div class="advanced-toggle">
                <button mat-button type="button" 
                        (click)="toggleAdvancedSettings()" 
                        color="primary">
                  <mat-icon>{{ showAdvancedSettings ? 'expand_less' : 'expand_more' }}</mat-icon>
                  {{ showAdvancedSettings ? 'Hide' : 'Show' }} Advanced Settings
                </button>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
        
        <mat-divider class="divider"></mat-divider>
        
        <!-- Common Settings for Both Modes -->
        <div class="common-settings">
          <h4>Ceremony Settings</h4>
          
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
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="form.invalid || loading"
              (click)="onSubmit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ selectedTabIndex === 0 ? 'Add Question' : 'Create & Add Question' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .add-question-form {
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
    
    .tab-content {
      padding: 16px 0;
    }
    
    .form-section {
      margin-bottom: 24px;
    }
    
    .form-section h4 {
      margin: 0 0 16px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-medium-size);
      font-weight: 500;
    }
    
    .form-section h5 {
      margin: 0 0 12px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-small-size);
      font-weight: 500;
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
    
    .selected-question-preview {
      margin-top: 16px;
      padding: 16px;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: var(--md-sys-shape-corner-medium);
    }
    
    .selected-question-preview h4 {
      margin: 0 0 12px 0;
      color: var(--md-sys-color-on-surface);
    }
    
    .question-preview p {
      margin: 4px 0;
      font-size: 0.875rem;
    }
    
    .question-type {
      color: var(--md-sys-color-on-surface-variant);
      font-style: italic;
    }
    
    .options-section {
      margin-bottom: 16px;
    }
    
    .option-row {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .option-text {
      flex: 2;
    }
    
    .option-value {
      flex: 1;
    }
    
    .remove-option-btn {
      flex-shrink: 0;
    }
    
    .add-option-btn {
      margin-top: 8px;
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    .scale-section {
      margin-bottom: 16px;
    }
    
    .advanced-toggle {
      text-align: center;
      margin: 16px 0;
    }
    
    .advanced-toggle button {
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    .divider {
      margin: 24px 0;
    }
    
    .common-settings {
      margin-top: 16px;
    }
    
    .common-settings h4 {
      margin: 0 0 16px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-medium-size);
      font-weight: 500;
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
    
    mat-dialog-actions button {
      min-width: 100px;
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    @media (max-width: 600px) {
      .add-question-form {
        min-width: 300px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .half-width {
        width: 100%;
      }
      
      .option-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .option-text,
      .option-value {
        width: 100%;
      }
    }
  `]
})
export class AddQuestionDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  selectedQuestion: Question | null = null;
  selectedTabIndex = 0;
  showAdvancedSettings = false;

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
      is_required: [true],
      // New question creation fields
      new_question_text: [''],
      new_question_type: [''],
      new_help_text: [''],
      new_min_value: [null],
      new_max_value: [null],
      new_min_label: [''],
      new_max_label: [''],
      new_options: this.fb.array([])
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

    // Watch for question type changes to show/hide advanced settings
    this.form.get('new_question_type')?.valueChanges.subscribe(questionType => {
      if (['multiple_choice', 'checkboxes', 'dropdown', 'linear_scale'].includes(questionType)) {
        this.showAdvancedSettings = true;
      }
    });

    // Initialize with default options for choice-based questions
    this.addOption();
    this.addOption();
  }

  get availableQuestions(): Question[] {
    return this.data.availableQuestions.filter(q => 
      !this.data.existingQuestionIds.includes(q.id)
    );
  }

  get existingQuestionIds(): number[] {
    return this.data.existingQuestionIds;
  }

  get optionsArray() {
    return this.form.get('new_options') as any;
  }

  addOption(): void {
    const option = this.fb.group({
      text: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.optionsArray.push(option);
  }

  removeOption(index: number): void {
    if (this.optionsArray.length > 1) {
      this.optionsArray.removeAt(index);
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    
    // Clear validation errors when switching tabs
    if (index === 0) {
      // Select existing question mode
      this.form.get('new_question_text')?.clearValidators();
      this.form.get('new_question_type')?.clearValidators();
      this.form.get('question_id')?.setValidators([Validators.required]);
    } else {
      // Create new question mode
      this.form.get('question_id')?.clearValidators();
      this.form.get('new_question_text')?.setValidators([Validators.required]);
      this.form.get('new_question_type')?.setValidators([Validators.required]);
    }
    
    this.form.get('question_id')?.updateValueAndValidity();
    this.form.get('new_question_text')?.updateValueAndValidity();
    this.form.get('new_question_type')?.updateValueAndValidity();
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.loading = true;
      
      if (this.selectedTabIndex === 0) {
        // Add existing question to ceremony
        this.addExistingQuestion();
      } else {
        // Create new question and add to ceremony
        this.createAndAddQuestion();
      }
    }
  }

  private addExistingQuestion(): void {
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

  private createAndAddQuestion(): void {
    const formValue = this.form.value;
    
    // Prepare the new question data
    const newQuestionData: any = {
      text: formValue.new_question_text,
      question_type: formValue.new_question_type,
      help_text: formValue.new_help_text || null,
      min_value: formValue.new_min_value || null,
      max_value: formValue.new_max_value || null,
      min_label: formValue.new_min_label || null,
      max_label: formValue.new_max_label || null
    };

    // Create the new question first
    this.ceremoniesService.createQuestion(newQuestionData).subscribe({
      next: (newQuestion) => {
        // Now add the new question to the ceremony
        const ceremonyQuestionData: CeremonyQuestionCreate = {
          ceremony_id: this.data.ceremonyId,
          question_id: newQuestion.id,
          order_index: formValue.order_index,
          is_required: formValue.is_required
        };

        this.ceremoniesService.addQuestionToCeremony(
          this.data.ceremonyId,
          ceremonyQuestionData
        ).subscribe({
          next: (ceremonyQuestion) => {
            // Create question options if needed
            if (['multiple_choice', 'checkboxes', 'dropdown'].includes(formValue.new_question_type) && 
                this.optionsArray.length > 0) {
              this.createQuestionOptions(newQuestion.id, formValue.new_options);
            } else {
              this.loading = false;
              this.snackBar.open('Question created and added successfully!', 'Close', { duration: 3000 });
              this.dialogRef.close({
                question: newQuestion,
                ceremonyQuestion: ceremonyQuestion
              });
            }
          },
          error: (error) => {
            this.loading = false;
            console.error('Error adding question to ceremony:', error);
            const errorMessage = error.error?.detail || error.message || 'Failed to add question to ceremony';
            this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
          }
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating question:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to create question';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  private createQuestionOptions(questionId: number, options: any[]): void {
    // Create options in parallel
    const optionPromises = options.map((option, index) => 
      this.ceremoniesService.createQuestionOption(questionId, {
        question_id: questionId,
        text: option.text,
        value: option.value,
        order_index: index,
        is_correct: false
      }).toPromise()
    );

    Promise.all(optionPromises).then(() => {
      this.loading = false;
      this.snackBar.open('Question created and added successfully!', 'Close', { duration: 3000 });
      this.dialogRef.close();
    }).catch((error) => {
      this.loading = false;
      console.error('Error creating question options:', error);
      this.snackBar.open('Question created but failed to add options', 'Close', { duration: 5000 });
    });
  }
}
