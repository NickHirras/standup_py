import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { CeremoniesService, Question, CeremonyQuestion, CeremonyQuestionCreate } from '../../../../services/ceremonies.service';
import { QuestionTemplatesService, QuestionTemplate, QuestionTemplateItem, QuestionTemplateOption } from '../../../../services/question-templates.service';
import { forkJoin, Observable } from 'rxjs';

export interface BulkOperationsDialogData {
  ceremonyId: number;
  ceremonyQuestions: CeremonyQuestion[];
  availableQuestions: Question[];
}

@Component({
  selector: 'app-bulk-operations-dialog',
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
    MatDividerModule,
    MatListModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>settings_bulk_edit</mat-icon>
      Bulk Operations
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="bulk-operations-form">
        <!-- Mode Selection Tabs -->
        <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedIndexChange)="onTabChange($event)">
          
          <!-- Add Multiple Questions Tab -->
          <mat-tab label="Add Multiple Questions">
            <div class="tab-content">
              <div class="form-section">
                <h4>Select Questions to Add</h4>
                <p class="section-description">
                  Choose multiple questions from the available question library to add to this ceremony.
                </p>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Search Questions</mat-label>
                  <input matInput formControlName="questionSearch" 
                         placeholder="Type to search questions...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                
                <div class="questions-selection">
                  <div class="selection-header">
                    <h5>Available Questions ({{ filteredQuestions.length }})</h5>
                    <div class="selection-actions">
                      <button mat-button type="button" 
                              (click)="selectAllQuestions()" 
                              color="primary">
                        Select All
                      </button>
                      <button mat-button type="button" 
                              (click)="clearSelection()" 
                              color="warn">
                        Clear
                      </button>
                    </div>
                  </div>
                  
                  <div class="questions-list">
                    <div *ngFor="let question of filteredQuestions" 
                         class="question-item"
                         [class.selected]="isQuestionSelected(question.id)">
                      <mat-checkbox [formControlName]="'question_' + question.id"
                                   color="primary">
                        <div class="question-content">
                          <div class="question-text">{{ question.text }}</div>
                          <div class="question-meta">
                            <mat-chip [color]="getQuestionTypeColor(question.question_type)" 
                                     selected class="question-type-chip">
                              {{ question.question_type.replace('_', ' ') }}
                            </mat-chip>
                            <span class="question-help" *ngIf="question.help_text">
                              {{ question.help_text }}
                            </span>
                          </div>
                        </div>
                      </mat-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <!-- Question Templates Tab -->
          <mat-tab label="Question Templates">
            <div class="tab-content">
              <div class="form-section">
                <h4>Apply Question Templates</h4>
                <p class="section-description">
                  Use pre-configured question sets for common ceremony types.
                </p>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Search Templates</mat-label>
                  <input matInput formControlName="templateSearch" 
                         placeholder="Type to search templates...">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                
                <div class="templates-grid">
                  <mat-card *ngFor="let template of filteredTemplates" 
                           class="template-card"
                           [class.selected]="isTemplateSelected(template.id)">
                    <mat-card-header>
                      <mat-card-title>{{ template.name }}</mat-card-title>
                      <mat-card-subtitle>{{ template.category }}</mat-card-subtitle>
                    </mat-card-header>
                    
                    <mat-card-content>
                      <p class="template-description">{{ template.description }}</p>
                      <div class="template-meta">
                        <span class="question-count">
                          <mat-icon>quiz</mat-icon>
                          {{ template.questions.length }} questions
                        </span>
                        <div class="template-tags">
                          <mat-chip *ngFor="let tag of template.tags.slice(0, 3)" 
                                   color="accent" selected class="tag-chip">
                            {{ tag }}
                          </mat-chip>
                          <span *ngIf="template.tags.length > 3" class="more-tags">
                            +{{ template.tags.length - 3 }} more
                          </span>
                        </div>
                      </div>
                    </mat-card-content>
                    
                    <mat-card-actions>
                                             <button mat-button type="button" 
                               (click)="openTemplatePreview(template)" 
                               color="primary">
                        <mat-icon>visibility</mat-icon>
                        Preview
                      </button>
                      <button mat-button type="button" 
                              (click)="toggleTemplateSelection(template.id)" 
                              [color]="isTemplateSelected(template.id) ? 'warn' : 'primary'">
                        <mat-icon>{{ isTemplateSelected(template.id) ? 'remove' : 'add' }}</mat-icon>
                        {{ isTemplateSelected(template.id) ? 'Remove' : 'Add' }}
                      </button>
                    </mat-card-actions>
                  </mat-card>
                </div>
              </div>
            </div>
          </mat-tab>
          
          <!-- Remove Questions Tab -->
          <mat-tab label="Remove Questions">
            <div class="tab-content">
              <div class="form-section">
                <h4>Select Questions to Remove</h4>
                <p class="section-description">
                  Choose questions to remove from this ceremony. This action cannot be undone.
                </p>
                
                <div class="current-questions">
                  <h5>Current Ceremony Questions ({{ data.ceremonyQuestions.length }})</h5>
                  
                  <div class="questions-list">
                    <div *ngFor="let ceremonyQuestion of data.ceremonyQuestions" 
                         class="question-item"
                         [class.selected]="isQuestionMarkedForRemoval(ceremonyQuestion.question_id)">
                      <mat-checkbox [formControlName]="'remove_' + ceremonyQuestion.question_id"
                                   color="warn">
                        <div class="question-content">
                          <div class="question-text">
                            {{ getQuestionText(ceremonyQuestion.question_id) }}
                          </div>
                          <div class="question-meta">
                            <mat-chip [color]="ceremonyQuestion.is_required ? 'warn' : 'default'" 
                                     selected class="question-type-chip">
                              {{ ceremonyQuestion.is_required ? 'Required' : 'Optional' }}
                            </mat-chip>
                            <span class="question-order">
                              Order: {{ ceremonyQuestion.order_index }}
                            </span>
                          </div>
                        </div>
                      </mat-checkbox>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
        
        <mat-divider class="divider"></mat-divider>
        
        <!-- Common Settings -->
        <div class="common-settings" *ngIf="selectedTabIndex !== 2">
          <h4>Bulk Settings</h4>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Starting Order Index</mat-label>
              <input matInput type="number" formControlName="starting_order_index" 
                     placeholder="e.g., 0">
              <mat-hint>Questions will be added starting from this position</mat-hint>
            </mat-form-field>
            
            <div class="checkbox-field half-width">
              <mat-checkbox formControlName="all_required" color="primary">
                Mark all questions as required
              </mat-checkbox>
            </div>
          </div>
          
          <div class="operation-summary">
            <h5>Operation Summary</h5>
            <div class="summary-stats">
              <div class="stat-item">
                <mat-icon>add_circle</mat-icon>
                <span>Questions to Add: {{ getQuestionsToAddCount() }}</span>
              </div>
              <div class="stat-item" *ngIf="selectedTabIndex === 1">
                <mat-icon>template</mat-icon>
                <span>Templates to Apply: {{ getSelectedTemplatesCount() }}</span>
              </div>
              <div class="stat-item" *ngIf="selectedTabIndex === 2">
                <mat-icon>remove_circle</mat-icon>
                <span>Questions to Remove: {{ getQuestionsToRemoveCount() }}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!canProceed() || loading"
              (click)="onSubmit()">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">{{ getActionButtonText() }}</span>
      </button>
    </mat-dialog-actions>
    
    <!-- Template Preview Dialog -->
    <div class="template-preview-overlay" *ngIf="showTemplatePreview" 
         (click)="closeTemplatePreview()">
      <div class="template-preview-modal" (click)="$event.stopPropagation()">
        <div class="preview-header">
          <h3>{{ previewTemplate?.name }}</h3>
          <button mat-icon-button (click)="closeTemplatePreview()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="preview-content">
          <p class="preview-description">{{ previewTemplate?.description }}</p>
          
          <div class="preview-questions">
            <h4>Questions in this template:</h4>
            <mat-list>
              <mat-list-item *ngFor="let question of previewTemplate?.questions; let i = index">
                <mat-icon matListItemIcon>quiz</mat-icon>
                <div matListItemTitle>{{ question.text }}</div>
                <div matListItemLine>
                  <mat-chip [color]="getQuestionTypeColor(question.question_type)" 
                           selected class="question-type-chip">
                    {{ question.question_type.replace('_', ' ') }}
                  </mat-chip>
                  <mat-chip [color]="question.is_required ? 'warn' : 'default'" 
                           selected class="question-type-chip">
                    {{ question.is_required ? 'Required' : 'Optional' }}
                  </mat-chip>
                </div>
                <div matListItemLine *ngIf="question.help_text">
                  {{ question.help_text }}
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bulk-operations-form {
      min-width: 600px;
      max-width: 800px;
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
      margin: 0 0 8px 0;
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
    
    .section-description {
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .questions-selection {
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      padding: 16px;
    }
    
    .selection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .selection-actions {
      display: flex;
      gap: 8px;
    }
    
    .questions-list {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .question-item {
      padding: 8px;
      border-radius: var(--md-sys-shape-corner-small);
      margin-bottom: 8px;
      transition: background-color 0.2s;
    }
    
    .question-item:hover {
      background-color: var(--md-sys-color-surface-variant);
    }
    
    .question-item.selected {
      background-color: var(--md-sys-color-primary-container);
    }
    
    .question-content {
      margin-left: 8px;
    }
    
    .question-text {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .question-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .question-type-chip {
      font-size: 0.75rem;
    }
    
    .question-help {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant);
      font-style: italic;
    }
    
    .question-order {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .template-card {
      border-radius: var(--md-sys-shape-corner-large);
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .template-card:hover {
      box-shadow: var(--md-sys-elevation-level2) 0px 3px 6px 0px;
    }
    
    .template-card.selected {
      border: 2px solid var(--md-sys-color-primary);
      background-color: var(--md-sys-color-primary-container);
    }
    
    .template-description {
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 12px;
      line-height: 1.4;
    }
    
    .template-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .question-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant);
    }
    
    .template-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    
    .tag-chip {
      font-size: 0.75rem;
    }
    
    .more-tags {
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface-variant);
      align-self: center;
    }
    
    .current-questions {
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      padding: 16px;
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
    
    .checkbox-field {
      display: flex;
      align-items: center;
      height: 56px;
    }
    
    .operation-summary {
      background-color: var(--md-sys-color-surface-variant);
      border-radius: var(--md-sys-shape-corner-medium);
      padding: 16px;
      margin-top: 16px;
    }
    
    .operation-summary h5 {
      margin: 0 0 12px 0;
      color: var(--md-sys-color-on-surface);
    }
    
    .summary-stats {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface);
    }
    
    .stat-item mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    
    .template-preview-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    
    .template-preview-modal {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--md-sys-shape-corner-large);
      padding: 24px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: var(--md-sys-elevation-level4) 0px 8px 16px 0px;
    }
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .preview-header h3 {
      margin: 0;
      color: var(--md-sys-color-on-surface);
    }
    
    .preview-description {
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    .preview-questions h4 {
      margin: 0 0 12px 0;
      color: var(--md-sys-color-on-surface);
    }
    
    mat-dialog-actions {
      padding: 16px 0;
    }
    
    mat-dialog-actions button {
      min-width: 120px;
      border-radius: var(--md-sys-shape-corner-large);
    }
    
    @media (max-width: 768px) {
      .bulk-operations-form {
        min-width: 300px;
      }
      
      .form-row {
        flex-direction: column;
        gap: 8px;
      }
      
      .half-width {
        width: 100%;
      }
      
      .templates-grid {
        grid-template-columns: 1fr;
      }
      
      .selection-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .selection-actions {
        justify-content: center;
      }
    }
  `]
})
export class BulkOperationsDialogComponent implements OnInit {
  form: FormGroup;
  loading = false;
  selectedTabIndex = 0;
  availableQuestions: Question[] = [];
  filteredQuestions: Question[] = [];
  templates: QuestionTemplate[] = [];
  filteredTemplates: QuestionTemplate[] = [];
  showTemplatePreview = false;
  previewTemplate: QuestionTemplate | null = null;

  constructor(
    private fb: FormBuilder,
    private ceremoniesService: CeremoniesService,
    private questionTemplatesService: QuestionTemplatesService,
    private dialogRef: MatDialogRef<BulkOperationsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulkOperationsDialogData,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      questionSearch: [''],
      templateSearch: [''],
      starting_order_index: [0],
      all_required: [false]
    });
  }

  ngOnInit(): void {
    this.loadData();
    this.setupFormListeners();
  }

  private loadData(): void {
    // Load available questions
    this.availableQuestions = this.data.availableQuestions;
    this.filteredQuestions = [...this.availableQuestions];

    // Load question templates
    this.questionTemplatesService.getTemplates().subscribe(templates => {
      this.templates = templates;
      this.filteredTemplates = [...templates];
    });

    // Add form controls for questions
    this.availableQuestions.forEach(question => {
      this.form.addControl(`question_${question.id}`, this.fb.control(false));
    });

    // Add form controls for templates
    this.questionTemplatesService.getTemplates().subscribe(templates => {
      templates.forEach(template => {
        this.form.addControl(`template_${template.id}`, this.fb.control(false));
      });
    });

    // Add form controls for removal
    this.data.ceremonyQuestions.forEach(ceremonyQuestion => {
      this.form.addControl(`remove_${ceremonyQuestion.question_id}`, this.fb.control(false));
    });
  }

  private setupFormListeners(): void {
    // Listen for question search changes
    this.form.get('questionSearch')?.valueChanges.subscribe(searchTerm => {
      this.filterQuestions(searchTerm);
    });

    // Listen for template search changes
    this.form.get('templateSearch')?.valueChanges.subscribe(searchTerm => {
      this.filterTemplates(searchTerm);
    });
  }

  private filterQuestions(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredQuestions = [...this.availableQuestions];
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      this.filteredQuestions = this.availableQuestions.filter(q =>
        q.text.toLowerCase().includes(lowerTerm) ||
        q.question_type.toLowerCase().includes(lowerTerm) ||
        (q.help_text && q.help_text.toLowerCase().includes(lowerTerm))
      );
    }
  }

  private filterTemplates(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredTemplates = [...this.templates];
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      this.filteredTemplates = this.templates.filter(t =>
        t.name.toLowerCase().includes(lowerTerm) ||
        t.description.toLowerCase().includes(lowerTerm) ||
        t.category.toLowerCase().includes(lowerTerm) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
      );
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  selectAllQuestions(): void {
    this.filteredQuestions.forEach(question => {
      this.form.get(`question_${question.id}`)?.setValue(true);
    });
  }

  clearSelection(): void {
    this.filteredQuestions.forEach(question => {
      this.form.get(`question_${question.id}`)?.setValue(false);
    });
  }

  isQuestionSelected(questionId: number): boolean {
    return this.form.get(`question_${questionId}`)?.value || false;
  }

  isTemplateSelected(templateId: string): boolean {
    return this.form.get(`template_${templateId}`)?.value || false;
  }

  isQuestionMarkedForRemoval(questionId: number): boolean {
    return this.form.get(`remove_${questionId}`)?.value || false;
  }

  toggleTemplateSelection(templateId: string): void {
    const currentValue = this.form.get(`template_${templateId}`)?.value || false;
    this.form.get(`template_${templateId}`)?.setValue(!currentValue);
  }

  openTemplatePreview(template: QuestionTemplate): void {
    this.previewTemplate = template;
    this.showTemplatePreview = true;
  }

  closeTemplatePreview(): void {
    this.showTemplatePreview = false;
    this.previewTemplate = null;
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

  getQuestionText(questionId: number): string {
    const question = this.availableQuestions.find(q => q.id === questionId);
    return question ? question.text : 'Unknown Question';
  }

  getQuestionsToAddCount(): number {
    return this.availableQuestions.filter(q => 
      this.form.get(`question_${q.id}`)?.value
    ).length;
  }

  getSelectedTemplatesCount(): number {
    return this.templates.filter(t => 
      this.form.get(`template_${t.id}`)?.value
    ).length;
  }

  getQuestionsToRemoveCount(): number {
    return this.data.ceremonyQuestions.filter(cq => 
      this.form.get(`remove_${cq.question_id}`)?.value
    ).length;
  }

  canProceed(): boolean {
    switch (this.selectedTabIndex) {
      case 0: // Add multiple questions
        return this.getQuestionsToAddCount() > 0;
      case 1: // Question templates
        return this.getSelectedTemplatesCount() > 0;
      case 2: // Remove questions
        return this.getQuestionsToRemoveCount() > 0;
      default:
        return false;
    }
  }

  getActionButtonText(): string {
    switch (this.selectedTabIndex) {
      case 0:
        return `Add ${this.getQuestionsToAddCount()} Questions`;
      case 1:
        return `Apply ${this.getSelectedTemplatesCount()} Templates`;
      case 2:
        return `Remove ${this.getQuestionsToRemoveCount()} Questions`;
      default:
        return 'Proceed';
    }
  }

  onSubmit(): void {
    if (!this.canProceed()) return;

    this.loading = true;

    switch (this.selectedTabIndex) {
      case 0:
        this.addMultipleQuestions();
        break;
      case 1:
        this.applyQuestionTemplates();
        break;
      case 2:
        this.removeMultipleQuestions();
        break;
    }
  }

  private addMultipleQuestions(): void {
    const selectedQuestions = this.availableQuestions.filter(q => 
      this.form.get(`question_${q.id}`)?.value
    );
    
    const startingOrder = this.form.get('starting_order_index')?.value || 0;
    const allRequired = this.form.get('all_required')?.value || false;

    const operations = selectedQuestions.map((question, index) => {
      const questionData: CeremonyQuestionCreate = {
        ceremony_id: this.data.ceremonyId,
        question_id: question.id,
        order_index: startingOrder + index,
        is_required: allRequired
      };
      return this.ceremoniesService.addQuestionToCeremony(
        this.data.ceremonyId, 
        questionData
      );
    });

    forkJoin(operations).subscribe({
      next: (results) => {
        this.loading = false;
        this.snackBar.open(
          `Successfully added ${results.length} questions to the ceremony!`, 
          'Close', 
          { duration: 3000 }
        );
        this.dialogRef.close({ type: 'add', results });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error adding multiple questions:', error);
        this.snackBar.open(
          'Failed to add some questions. Please try again.', 
          'Close', 
          { duration: 5000 }
        );
      }
    });
  }

  private applyQuestionTemplates(): void {
    const selectedTemplates = this.templates.filter(t => 
      this.form.get(`template_${t.id}`)?.value
    );
    
    const startingOrder = this.form.get('starting_order_index')?.value || 0;
    const allRequired = this.form.get('all_required')?.value || false;

    // Flatten all questions from selected templates
    const allTemplateQuestions: Array<{ template: QuestionTemplate, question: QuestionTemplateItem, index: number }> = [];
    let currentOrder = startingOrder;

    selectedTemplates.forEach(template => {
      template.questions.forEach((question, index) => {
        allTemplateQuestions.push({
          template,
          question,
          index: currentOrder + index
        });
      });
      currentOrder += template.questions.length;
    });

    // Create questions and add to ceremony
    this.createQuestionsFromTemplates(allTemplateQuestions, allRequired);
  }

  private createQuestionsFromTemplates(
    templateQuestions: Array<{ template: QuestionTemplate, question: QuestionTemplateItem, index: number }>,
    allRequired: boolean
  ): void {
    if (templateQuestions.length === 0) {
      this.loading = false;
      this.dialogRef.close({ type: 'templates', results: [] });
      return;
    }

    const currentItem = templateQuestions[0];
    const { question, index } = currentItem;

    // Create the question first
    const questionData: any = {
      text: question.text,
      question_type: question.question_type,
      help_text: question.help_text || null,
      min_value: question.min_value || null,
      max_value: question.max_value || null,
      min_label: question.min_label || null,
      max_label: question.max_label || null
    };

    this.ceremoniesService.createQuestion(questionData).subscribe({
      next: (newQuestion) => {
        // Add question to ceremony
        const ceremonyQuestionData: CeremonyQuestionCreate = {
          ceremony_id: this.data.ceremonyId,
          question_id: newQuestion.id,
          order_index: index,
          is_required: allRequired || question.is_required
        };

        this.ceremoniesService.addQuestionToCeremony(
          this.data.ceremonyId,
          ceremonyQuestionData
        ).subscribe({
          next: (ceremonyQuestion) => {
            // Create options if needed
            if (question.options && question.options.length > 0) {
              this.createOptionsForTemplateQuestion(newQuestion.id, question.options, () => {
                // Continue with next question
                this.createQuestionsFromTemplates(templateQuestions.slice(1), allRequired);
              });
            } else {
              // Continue with next question
              this.createQuestionsFromTemplates(templateQuestions.slice(1), allRequired);
            }
          },
          error: (error) => {
            console.error('Error adding template question to ceremony:', error);
            // Continue with next question even if this one fails
            this.createQuestionsFromTemplates(templateQuestions.slice(1), allRequired);
          }
        });
      },
      error: (error) => {
        console.error('Error creating template question:', error);
        // Continue with next question even if this one fails
        this.createQuestionsFromTemplates(templateQuestions.slice(1), allRequired);
      }
    });
  }

  private createOptionsForTemplateQuestion(
    questionId: number, 
    options: QuestionTemplateOption[], 
    onComplete: () => void
  ): void {
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
      onComplete();
    }).catch((error) => {
      console.error('Error creating question options:', error);
      onComplete(); // Continue even if options fail
    });
  }

  private removeMultipleQuestions(): void {
    const questionsToRemove = this.data.ceremonyQuestions.filter(cq => 
      this.form.get(`remove_${cq.question_id}`)?.value
    );

    const operations = questionsToRemove.map(ceremonyQuestion => 
      this.ceremoniesService.removeQuestionFromCeremony(
        ceremonyQuestion.ceremony_id,
        ceremonyQuestion.question_id
      )
    );

    forkJoin(operations).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open(
          `Successfully removed ${questionsToRemove.length} questions from the ceremony!`, 
          'Close', 
          { duration: 3000 }
        );
        this.dialogRef.close({ type: 'remove', results: questionsToRemove });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error removing multiple questions:', error);
        this.snackBar.open(
          'Failed to remove some questions. Please try again.', 
          'Close', 
          { duration: 5000 }
        );
      }
    });
  }
}
