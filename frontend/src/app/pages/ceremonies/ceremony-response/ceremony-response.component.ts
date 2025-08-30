import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';

import { CeremoniesService, Ceremony, CeremonyQuestion, Question } from '../../../services/ceremonies.service';
import { ResponsesService, CeremonyResponseCreate, QuestionResponseData } from '../../../services/responses.service';
import { AuthService } from '../../../services/auth.service';
import { TeamsService, Team } from '../../../services/teams.service';

@Component({
  selector: 'app-ceremony-response',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule
  ],
  template: `
    <div class="page-header" *ngIf="ceremony">
      <div class="header-content">
        <div>
          <h1 class="page-title">Respond to {{ ceremony.name }}</h1>
          <p class="page-subtitle">Share your thoughts and feedback for this ceremony</p>
        </div>
        <div class="header-actions">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to Ceremony
          </button>
        </div>
      </div>
    </div>

    <div class="response-container" *ngIf="!loading && ceremony">
      <!-- Response Form -->
      <mat-card class="response-form-card">
        <mat-card-header>
          <mat-card-title>Response Form</mat-card-title>
          <mat-card-subtitle>
            {{ ceremonyQuestions.length }} questions to answer
            <span class="required-count" *ngIf="requiredQuestionsCount > 0">
              ({{ requiredQuestionsCount }} required)
            </span>
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="responseForm" class="response-form">
            <!-- Questions -->
            <div class="questions-section">
              <div formArrayName="questionResponses">
                <div *ngFor="let questionGroup of questionResponsesArray.controls; let i = index" 
                     [formGroupName]="i" 
                     class="question-item">
                  
                  <div class="question-header">
                    <h3 class="question-number">Question {{ i + 1 }}</h3>
                    <div class="question-meta">
                      <mat-chip [color]="getQuestionTypeColor(getQuestionByIndex(i)?.question?.question_type || '')" 
                               selected class="question-type-chip">
                        {{ getQuestionByIndex(i)?.question?.question_type?.replace('_', ' ') }}
                      </mat-chip>
                      <mat-chip [color]="getQuestionByIndex(i)?.is_required ? 'warn' : 'default'" 
                               selected class="question-required-chip">
                        {{ getQuestionByIndex(i)?.is_required ? 'Required' : 'Optional' }}
                      </mat-chip>
                    </div>
                  </div>
                  
                  <div class="question-content">
                    <p class="question-text">{{ getQuestionByIndex(i)?.question?.text }}</p>
                    <p class="question-help" *ngIf="getQuestionByIndex(i)?.question?.help_text">
                      {{ getQuestionByIndex(i)?.question?.help_text }}
                    </p>
                  </div>
                  
                  <!-- Dynamic Response Fields Based on Question Type -->
                  <div class="response-fields">
                    <!-- Text-based responses -->
                    <div *ngIf="['short_answer', 'paragraph'].includes(getQuestionByIndex(i)?.question?.question_type || '')">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Your Response</mat-label>
                        <textarea matInput 
                                  [formControlName]="'text_response'"
                                  [rows]="getQuestionByIndex(i)?.question?.question_type === 'paragraph' ? 4 : 2"
                                  [placeholder]="getQuestionByIndex(i)?.question?.question_type === 'paragraph' ? 'Share your detailed thoughts...' : 'Brief response...'"
                                  [required]="getQuestionByIndex(i)?.is_required || false">
                        </textarea>
                        <mat-error *ngIf="questionGroup.get('text_response')?.hasError('required')">
                          This response is required
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <!-- Multiple choice responses -->
                    <div *ngIf="['multiple_choice', 'dropdown'].includes(getQuestionByIndex(i)?.question?.question_type || '')">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Select Answer</mat-label>
                        <mat-select [formControlName]="'selected_options'" 
                                   [required]="getQuestionByIndex(i)?.is_required || false">
                          <mat-option *ngFor="let option of getQuestionByIndex(i)?.question?.options" 
                                      [value]="option.value">
                            {{ option.text }}
                          </mat-option>
                        </mat-select>
                        <mat-error *ngIf="questionGroup.get('selected_options')?.hasError('required')">
                          Please select an answer
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <!-- Checkbox responses -->
                    <div *ngIf="getQuestionByIndex(i)?.question?.question_type === 'checkboxes'">
                      <div class="checkbox-options">
                        <div *ngFor="let option of getQuestionByIndex(i)?.question?.options" 
                             class="checkbox-option">
                          <mat-checkbox [formControlName]="'selected_options'"
                                       [value]="option.value"
                                       [required]="getQuestionByIndex(i)?.is_required || false">
                            {{ option.text }}
                          </mat-checkbox>
                        </div>
                      </div>
                      <mat-error *ngIf="questionGroup.get('selected_options')?.hasError('required')" 
                                class="checkbox-error">
                        Please select at least one option
                      </mat-error>
                    </div>
                    
                    <!-- Linear scale responses -->
                    <div *ngIf="getQuestionByIndex(i)?.question?.question_type === 'linear_scale'">
                      <div class="scale-container">
                        <div class="scale-labels">
                          <span class="min-label">{{ getQuestionByIndex(i)?.question?.min_label || 'Min' }}</span>
                          <span class="max-label">{{ getQuestionByIndex(i)?.question?.max_label || 'Max' }}</span>
                        </div>
                        <mat-slider [min]="getQuestionByIndex(i)?.question?.min_value || 1"
                                   [max]="getQuestionByIndex(i)?.question?.max_value || 10"
                                   [step]="1"
                                   [discrete]="true"
                                   [showTickMarks]="true"
                                   class="scale-slider">
                          <input matSliderThumb [formControlName]="'numeric_response'">
                        </mat-slider>
                        <div class="scale-value">
                          <span class="value-display">{{ questionGroup.get('numeric_response')?.value || '--' }}</span>
                        </div>
                      </div>
                      <mat-error *ngIf="questionGroup.get('numeric_response')?.hasError('required')">
                        Please provide a rating
                      </mat-error>
                    </div>
                    
                    <!-- Date responses -->
                    <div *ngIf="getQuestionByIndex(i)?.question?.question_type === 'date'">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Select Date</mat-label>
                        <input matInput [matDatepicker]="datePicker" 
                               [formControlName]="'date_response'"
                               [required]="getQuestionByIndex(i)?.is_required || false">
                        <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
                        <mat-datepicker #datePicker></mat-datepicker>
                        <mat-error *ngIf="questionGroup.get('date_response')?.hasError('required')">
                          Please select a date
                        </mat-error>
                      </mat-form-field>
                    </div>
                    
                    <!-- Time responses -->
                    <div *ngIf="getQuestionByIndex(i)?.question?.question_type === 'time'">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Select Time</mat-label>
                        <input matInput type="time" 
                               [formControlName]="'time_response'"
                               [required]="getQuestionByIndex(i)?.is_required || false">
                        <mat-error *ngIf="questionGroup.get('time_response')?.hasError('required')">
                          Please select a time
                        </mat-error>
                      </mat-form-field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <mat-divider class="divider"></mat-divider>
            
            <!-- Additional Feedback -->
            <div class="additional-feedback">
              <h3>Additional Feedback</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Additional Notes (Optional)</mat-label>
                <textarea matInput formControlName="notes" 
                          rows="3" 
                          placeholder="Any additional thoughts or comments...">
                </textarea>
              </mat-form-field>
              
              <div class="mood-energy-section">
                <h4>How are you feeling?</h4>
                
                <div class="rating-row">
                  <div class="rating-item">
                    <label>Mood Rating</label>
                    <mat-slider [min]="1" [max]="10" [step]="1" [discrete]="true" class="rating-slider">
                      <input matSliderThumb formControlName="mood_rating">
                    </mat-slider>
                    <span class="rating-value">{{ responseForm.get('mood_rating')?.value || '--' }}/10</span>
                  </div>
                  
                  <div class="rating-item">
                    <label>Energy Level</label>
                    <mat-slider [min]="1" [max]="10" [step]="1" [discrete]="true" class="rating-slider">
                      <input matSliderThumb formControlName="energy_level">
                    </mat-slider>
                    <span class="rating-value">{{ responseForm.get('energy_level')?.value || '--' }}/10</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-button (click)="saveDraft()" [disabled]="saving">
            <mat-icon>save</mat-icon>
            Save Draft
          </button>
          <button mat-raised-button color="primary" 
                  (click)="submitResponse()" 
                  [disabled]="responseForm.invalid || saving">
            <mat-spinner *ngIf="saving" diameter="20"></mat-spinner>
            <span *ngIf="!saving">
              <mat-icon>send</mat-icon>
              Submit Response
            </span>
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
    
    <!-- Loading State -->
    <div class="loading-container" *ngIf="loading">
      <mat-card class="loading-card">
        <mat-card-content>
          <div class="loading-content">
            <mat-spinner diameter="50"></mat-spinner>
            <p>Loading ceremony questions...</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .response-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .response-form-card {
      border-radius: var(--md-sys-shape-corner-large);
      margin-bottom: 20px;
    }
    
    .response-form {
      padding: 20px 0;
    }
    
    .questions-section {
      margin-bottom: 30px;
    }
    
    .question-item {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      background-color: var(--md-sys-color-surface);
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .question-number {
      margin: 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-medium-size);
      font-weight: 500;
    }
    
    .question-meta {
      display: flex;
      gap: 8px;
    }
    
    .question-type-chip,
    .question-required-chip {
      font-size: 0.75rem;
    }
    
    .question-content {
      margin-bottom: 20px;
    }
    
    .question-text {
      font-size: var(--md-sys-typescale-body-large-size);
      color: var(--md-sys-color-on-surface);
      margin-bottom: 8px;
      line-height: 1.5;
    }
    
    .question-help {
      font-size: var(--md-sys-typescale-body-medium-size);
      color: var(--md-sys-color-on-surface-variant);
      font-style: italic;
      margin: 0;
    }
    
    .response-fields {
      margin-top: 16px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .checkbox-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .checkbox-option {
      display: flex;
      align-items: center;
    }
    
    .checkbox-error {
      color: var(--md-sys-color-error);
      font-size: 0.75rem;
      margin-top: 8px;
    }
    
    .scale-container {
      padding: 20px 0;
    }
    
    .scale-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .min-label,
    .max-label {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .scale-slider {
      width: 100%;
      margin-bottom: 16px;
    }
    
    .scale-value {
      text-align: center;
    }
    
    .value-display {
      font-size: 1.5rem;
      font-weight: 500;
      color: var(--md-sys-color-primary);
    }
    
    .divider {
      margin: 30px 0;
    }
    
    .additional-feedback h3 {
      margin: 0 0 20px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-medium-size);
    }
    
    .mood-energy-section {
      margin-top: 24px;
    }
    
    .mood-energy-section h4 {
      margin: 0 0 16px 0;
      color: var(--md-sys-color-on-surface);
      font-size: var(--md-sys-typescale-title-small-size);
    }
    
    .rating-row {
      display: flex;
      gap: 40px;
    }
    
    .rating-item {
      flex: 1;
    }
    
    .rating-item label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface);
    }
    
    .rating-slider {
      width: 100%;
      margin-bottom: 8px;
    }
    
    .rating-value {
      font-size: 1rem;
      font-weight: 500;
      color: var(--md-sys-color-primary);
    }
    
    .required-count {
      color: var(--md-sys-color-error);
      font-weight: 500;
    }
    
    mat-card-actions {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .loading-card {
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    .loading-content {
      text-align: center;
      padding: 40px;
    }
    
    .loading-content p {
      margin-top: 16px;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    @media (max-width: 768px) {
      .response-container {
        padding: 10px;
      }
      
      .question-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .rating-row {
        flex-direction: column;
        gap: 24px;
      }
      
      .question-meta {
        justify-content: center;
      }
    }
  `]
})
export class CeremonyResponseComponent implements OnInit {
  ceremony: Ceremony | null = null;
  ceremonyQuestions: CeremonyQuestion[] = [];
  availableQuestions: Question[] = [];
  userTeam: Team | null = null;
  
  responseForm: FormGroup;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ceremoniesService: CeremoniesService,
    private responsesService: ResponsesService,
    private authService: AuthService,
    private teamsService: TeamsService,
    private snackBar: MatSnackBar
  ) {
    this.responseForm = this.fb.group({
      questionResponses: this.fb.array([]),
      notes: [''],
      mood_rating: [5],
      energy_level: [5]
    });
  }

  ngOnInit(): void {
    this.loadCeremonyData();
  }

  private loadCeremonyData(): void {
    const ceremonyId = +this.route.snapshot.paramMap.get('id')!;
    
    this.ceremoniesService.getCeremony(ceremonyId).subscribe({
      next: (ceremony) => {
        this.ceremony = ceremony;
        this.loadCeremonyQuestions(ceremonyId);
        this.loadUserTeam(ceremony.team_id);
      },
      error: (error) => {
        console.error('Error loading ceremony:', error);
        this.snackBar.open('Failed to load ceremony', 'Close', { duration: 3000 });
        this.router.navigate(['/ceremonies']);
      }
    });
  }

  private loadCeremonyQuestions(ceremonyId: number): void {
    this.ceremoniesService.getCeremonyQuestions(ceremonyId).subscribe({
      next: (questions) => {
        this.ceremonyQuestions = questions.sort((a, b) => a.order_index - b.order_index);
        this.loadAvailableQuestions();
      },
      error: (error) => {
        console.error('Error loading ceremony questions:', error);
        this.snackBar.open('Failed to load ceremony questions', 'Close', { duration: 3000 });
      }
    });
  }

  private loadAvailableQuestions(): void {
    const questionIds = this.ceremonyQuestions.map(q => q.question_id);
    
    this.ceremoniesService.getAvailableQuestions().subscribe({
      next: (questions) => {
        this.availableQuestions = questions.filter(q => questionIds.includes(q.id));
        this.initializeForm();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading available questions:', error);
        this.snackBar.open('Failed to load questions', 'Close', { duration: 3000 });
      }
    });
  }

  private loadUserTeam(teamId: number): void {
    this.teamsService.getTeam(teamId).subscribe({
      next: (team) => {
        this.userTeam = team;
      },
      error: (error) => {
        console.error('Error loading team:', error);
      }
    });
  }

  private initializeForm(): void {
    const questionResponsesArray = this.responseForm.get('questionResponses') as FormArray;
    questionResponsesArray.clear();

    this.ceremonyQuestions.forEach(ceremonyQuestion => {
      const question = this.availableQuestions.find(q => q.id === ceremonyQuestion.question_id);
      if (!question) return;

      const questionGroup = this.fb.group({
        question_id: [ceremonyQuestion.question_id],
        text_response: [''],
        selected_options: [''],
        numeric_response: [null],
        date_response: [null],
        time_response: ['']
      });

      // Add validators based on question type and required status
      if (ceremonyQuestion.is_required) {
        if (['short_answer', 'paragraph'].includes(question.question_type)) {
          questionGroup.get('text_response')?.setValidators([Validators.required]);
        } else if (['multiple_choice', 'dropdown'].includes(question.question_type)) {
          questionGroup.get('selected_options')?.setValidators([Validators.required]);
        } else if (question.question_type === 'checkboxes') {
          questionGroup.get('selected_options')?.setValidators([Validators.required]);
        } else if (question.question_type === 'linear_scale') {
          questionGroup.get('numeric_response')?.setValidators([Validators.required]);
        } else if (question.question_type === 'date') {
          questionGroup.get('date_response')?.setValidators([Validators.required]);
        } else if (question.question_type === 'time') {
          questionGroup.get('time_response')?.setValidators([Validators.required]);
        }
      }

      questionResponsesArray.push(questionGroup);
    });
  }

  get questionResponsesArray(): FormArray {
    return this.responseForm.get('questionResponses') as FormArray;
  }

  get requiredQuestionsCount(): number {
    return this.ceremonyQuestions.filter(q => q.is_required).length;
  }

  getQuestionByIndex(index: number): CeremonyQuestion | null {
    return this.ceremonyQuestions[index] || null;
  }

  getQuestionTypeColor(questionType: string): string {
    const colorMap: { [key: string]: string } = {
      'short_answer': 'primary',
      'paragraph': 'primary',
      'multiple_choice': 'accent',
      'checkboxes': 'accent',
      'dropdown': 'accent',
      'linear_scale': 'warn',
      'date': 'primary',
      'time': 'primary'
    };
    return colorMap[questionType] || 'primary';
  }

  saveDraft(): void {
    // TODO: Implement draft saving functionality
    this.snackBar.open('Draft saving coming soon!', 'Close', { duration: 3000 });
  }

  submitResponse(): void {
    if (this.responseForm.invalid || !this.ceremony || !this.userTeam) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;

    const formValue = this.responseForm.value;
    const questionResponses: QuestionResponseData[] = formValue.questionResponses
      .map((response: any, index: number) => {
        const ceremonyQuestion = this.ceremonyQuestions[index];
        const question = this.availableQuestions.find(q => q.id === ceremonyQuestion.question_id);
        
        if (!question) return null;

        const questionResponse: QuestionResponseData = {
          question_id: response.question_id
        };

        // Set response based on question type
        switch (question.question_type) {
          case 'short_answer':
          case 'paragraph':
            questionResponse.text_response = response.text_response;
            break;
          case 'multiple_choice':
          case 'dropdown':
            questionResponse.selected_options = [response.selected_options];
            break;
          case 'checkboxes':
            questionResponse.selected_options = response.selected_options || [];
            break;
          case 'linear_scale':
            questionResponse.numeric_response = response.numeric_response;
            break;
          case 'date':
            questionResponse.date_response = response.date_response ? 
              this.responsesService.formatDateForAPI(new Date(response.date_response)) : undefined;
            break;
          case 'time':
            questionResponse.time_response = response.time_response;
            break;
        }

        return questionResponse;
      })
      .filter((response: QuestionResponseData | null) => response !== null);

    const responseData: CeremonyResponseCreate = {
      ceremony_id: this.ceremony.id,
      team_id: this.userTeam.id,
      question_responses: questionResponses,
      notes: formValue.notes,
      mood_rating: formValue.mood_rating,
      energy_level: formValue.energy_level
    };

    this.responsesService.createCeremonyResponse(responseData).subscribe({
      next: (response) => {
        this.saving = false;
        this.snackBar.open('Response submitted successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/ceremonies', this.ceremony!.id]);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error submitting response:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to submit response';
        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/ceremonies', this.ceremony!.id]);
  }
}
