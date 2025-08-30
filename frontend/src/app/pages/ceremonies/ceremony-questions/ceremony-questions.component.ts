import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CeremoniesService, Ceremony, CeremonyQuestion, Question, CeremonyQuestionCreate } from '../../../services/ceremonies.service';
import { AuthService } from '../../../services/auth.service';
import { AddQuestionDialogComponent } from './add-question-dialog/add-question-dialog.component';
import { EditQuestionDialogComponent } from './edit-question-dialog/edit-question-dialog.component';
import { BulkOperationsDialogComponent } from './bulk-operations-dialog/bulk-operations-dialog.component';
import { switchMap, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-ceremony-questions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatDialogModule,
    MatMenuModule,
    MatBadgeModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  template: `
    <div class="page-header" *ngIf="ceremony">
      <div class="header-content">
        <div>
          <h1 class="page-title">Questions for {{ ceremony.name }}</h1>
          <p class="page-subtitle">Manage questions and their order for this ceremony</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="addQuestion()" 
                  *ngIf="canManageQuestions">
            <mat-icon>add</mat-icon>
            Add Question
          </button>
          <button mat-raised-button color="accent" (click)="openBulkOperations()" 
                  *ngIf="canManageQuestions">
            <mat-icon>settings_bulk_edit</mat-icon>
            Bulk Operations
          </button>
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to Ceremony
          </button>
        </div>
      </div>
    </div>

    <div class="questions-container" *ngIf="!loading && ceremony">
      <!-- Questions List -->
      <mat-card class="questions-card">
        <mat-card-header>
          <mat-card-title>Ceremony Questions</mat-card-title>
          <mat-card-subtitle>{{ ceremonyQuestions.length }} questions configured</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="questions-list" *ngIf="ceremonyQuestions.length > 0; else noQuestions">
            <div cdkDropList 
                 (cdkDropListDropped)="onDrop($event)"
                 class="questions-drop-list">
              <div *ngFor="let ceremonyQuestion of ceremonyQuestions; let i = index" 
                   class="question-item"
                   cdkDrag
                   [class.dragging]="isDragging">
                <div class="question-content">
                  <div class="question-order">{{ i + 1 }}</div>
                  <div class="question-details">
                    <div class="question-text">{{ getQuestionText(ceremonyQuestion.question_id) }}</div>
                    <div class="question-meta">
                      <mat-chip [color]="ceremonyQuestion.is_required ? 'warn' : 'default'" selected>
                        {{ ceremonyQuestion.is_required ? 'Required' : 'Optional' }}
                      </mat-chip>
                      <span class="question-type">{{ getQuestionType(ceremonyQuestion.question_id) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="question-actions">
                  <div class="drag-handle" cdkDragHandle>
                    <mat-icon>drag_indicator</mat-icon>
                  </div>
                  <button mat-icon-button [matMenuTriggerFor]="questionMenu" 
                          *ngIf="canManageQuestions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #questionMenu="matMenu">
                    <button mat-menu-item (click)="editQuestion(ceremonyQuestion)">
                      <mat-icon>edit</mat-icon>
                      <span>Edit Question</span>
                    </button>
                    <button mat-menu-item (click)="moveQuestionUp(i)" 
                            [disabled]="i === 0">
                      <mat-icon>keyboard_arrow_up</mat-icon>
                      <span>Move Up</span>
                    </button>
                    <button mat-menu-item (click)="moveQuestionDown(i)" 
                            [disabled]="i === ceremonyQuestions.length - 1">
                      <mat-icon>keyboard_arrow_down</mat-icon>
                      <span>Move Down</span>
                    </button>
                    <button mat-menu-item color="warn" (click)="removeQuestion(ceremonyQuestion)">
                      <mat-icon>delete</mat-icon>
                      <span>Remove Question</span>
                    </button>
                  </mat-menu>
                </div>
              </div>
            </div>
          </div>
          
          <ng-template #noQuestions>
            <div class="empty-state">
              <mat-icon class="empty-icon">quiz</mat-icon>
              <h3>No Questions Yet</h3>
              <p>This ceremony doesn't have any questions configured yet.</p>
              <button mat-raised-button color="primary" (click)="addQuestion()" 
                      *ngIf="canManageQuestions">
                <mat-icon>add</mat-icon>
                Add Your First Question
              </button>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Loading spinner -->
    <div class="loading-container" *ngIf="loading">
      <mat-card class="loading-card">
        <mat-card-content class="loading-content">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Loading ceremony questions...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header-actions {
      display: flex;
      gap: 8px;
    }
    
    .questions-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .questions-card {
      margin-bottom: 24px;
    }
    
    .question-item {
      margin-bottom: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 8px;
    }
    
    .question-content {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 16px;
    }
    
    .question-order {
      background-color: #1976d2;
      color: white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 14px;
    }
    
    .question-details {
      flex: 1;
    }
    
    .question-text {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .question-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .question-type {
      font-size: 0.875rem;
      color: #666;
      text-transform: capitalize;
    }
    
    .question-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .drag-handle {
      cursor: move;
      color: #666;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .drag-handle:hover {
      background-color: #f0f0f0;
    }
    
    .questions-drop-list {
      min-height: 100px;
    }
    
    .question-item {
      cursor: move;
      transition: all 0.2s ease;
    }
    
    .question-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .question-item.dragging {
      opacity: 0.8;
      transform: rotate(2deg);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .question-item.cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 8px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    
    .question-item.cdk-drag-placeholder {
      opacity: 0.3;
      border: 2px dashed #ccc;
      background: #f9f9f9;
    }
    
    .question-item.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }
    
    .loading-card {
      text-align: center;
      padding: 32px;
    }
    
    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .loading-content p {
      margin: 0;
      color: #666;
    }
    
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #666;
    }
    
    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .empty-content h3 {
      margin: 0;
      color: #333;
    }
    
    .empty-content p {
      margin: 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .header-actions {
        justify-content: center;
      }
      
      .question-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class CeremonyQuestionsComponent implements OnInit {
  ceremony: Ceremony | null = null;
  ceremonyQuestions: CeremonyQuestion[] = [];
  availableQuestions: Question[] = [];
  loading = true;
  isDragging = false;

  constructor(
    private ceremoniesService: CeremoniesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCeremonyQuestions();
  }

  loadCeremonyQuestions(): void {
    this.route.params.pipe(
      switchMap(params => {
        const ceremonyId = +params['id'];
        return forkJoin({
          ceremony: this.ceremoniesService.getCeremony(ceremonyId),
          questions: this.ceremoniesService.getCeremonyQuestions(ceremonyId),
          available: this.ceremoniesService.getAvailableQuestions()
        });
      })
    ).subscribe({
      next: (data) => {
        this.ceremony = data.ceremony;
        this.ceremonyQuestions = data.questions;
        this.availableQuestions = data.available;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ceremony questions:', error);
        this.snackBar.open('Failed to load ceremony questions', 'Close', { duration: 3000 });
        this.loading = false;
        this.router.navigate(['/ceremonies']);
      }
    });
  }

  get canManageQuestions(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !this.ceremony) return false;
    
    if (currentUser.role === 'admin') return true;
    
    // TODO: Check if user is team manager for this ceremony's team
    return false;
  }

  getQuestionText(questionId: number): string {
    const question = this.availableQuestions.find(q => q.id === questionId);
    return question ? question.text : `Question ID: ${questionId}`;
  }

  getQuestionType(questionId: number): string {
    const question = this.availableQuestions.find(q => q.id === questionId);
    return question ? question.question_type.replace('_', ' ') : 'Unknown';
  }

  addQuestion(): void {
    if (!this.ceremony) return;
    
    const dialogRef = this.dialog.open(AddQuestionDialogComponent, {
      width: '500px',
      data: {
        ceremonyId: this.ceremony.id,
        availableQuestions: this.availableQuestions,
        existingQuestionIds: this.ceremonyQuestions.map(cq => cq.question_id)
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the questions list
        this.loadCeremonyQuestions();
      }
    });
  }

  editQuestion(ceremonyQuestion: CeremonyQuestion): void {
    // Find the full question details
    const question = this.availableQuestions.find(q => q.id === ceremonyQuestion.question_id);
    if (!question) {
      this.snackBar.open('Question details not found', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(EditQuestionDialogComponent, {
      width: '600px',
      data: {
        ceremonyId: this.ceremony!.id,
        ceremonyQuestion: ceremonyQuestion,
        question: question
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the local data
        const ceremonyQuestionIndex = this.ceremonyQuestions.findIndex(
          cq => cq.question_id === ceremonyQuestion.question_id
        );
        if (ceremonyQuestionIndex !== -1) {
          this.ceremonyQuestions[ceremonyQuestionIndex] = result.ceremonyQuestion;
        }

        // Update the available questions if the question itself was modified
        if (result.question) {
          const questionIndex = this.availableQuestions.findIndex(q => q.id === result.question.id);
          if (questionIndex !== -1) {
            this.availableQuestions[questionIndex] = result.question;
          }
        }

        this.snackBar.open('Question updated successfully!', 'Close', { duration: 3000 });
      }
    });
  }

  openBulkOperations(): void {
    const dialogRef = this.dialog.open(BulkOperationsDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        ceremonyId: this.ceremony!.id,
        ceremonyQuestions: this.ceremonyQuestions,
        availableQuestions: this.availableQuestions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the data based on the operation type
        switch (result.type) {
          case 'add':
            this.loadCeremonyQuestions();
            break;
          case 'templates':
            this.loadCeremonyQuestions();
            break;
          case 'remove':
            this.loadCeremonyQuestions();
            break;
        }
      }
    });
  }

  moveQuestionUp(index: number): void {
    if (index > 0) {
      this.reorderQuestions(index, index - 1);
    }
  }

  moveQuestionDown(index: number): void {
    if (index < this.ceremonyQuestions.length - 1) {
      this.reorderQuestions(index, index + 1);
    }
  }

  onDrop(event: CdkDragDrop<CeremonyQuestion[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    
    // Update the local array immediately for visual feedback
    moveItemInArray(this.ceremonyQuestions, event.previousIndex, event.currentIndex);
    
    // Update order indices
    const questionOrders = this.ceremonyQuestions.map((question, index) => ({
      question_id: question.question_id,
      order_index: index + 1
    }));

    // Call the backend to persist the new order
    if (this.ceremony) {
      this.ceremoniesService.reorderCeremonyQuestions(
        this.ceremony.id, 
        questionOrders
      ).subscribe({
        next: () => {
          this.snackBar.open('Question order updated successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error reordering questions:', error);
          this.snackBar.open('Failed to reorder questions', 'Close', { duration: 3000 });
          // Revert the local change on error
          this.loadCeremonyQuestions();
        }
      });
    }
  }

  private reorderQuestions(fromIndex: number, toIndex: number): void {
    if (!this.ceremony) return;

    // Create a copy of the questions array
    const questions = [...this.ceremonyQuestions];
    
    // Remove the question from its current position
    const [movedQuestion] = questions.splice(fromIndex, 1);
    
    // Insert it at the new position
    questions.splice(toIndex, 0, movedQuestion);
    
    // Update order indices
    const questionOrders = questions.map((question, index) => ({
      question_id: question.question_id,
      order_index: index + 1
    }));

    // Call the backend to update the order
    this.ceremoniesService.reorderCeremonyQuestions(
      this.ceremony.id, 
      questionOrders
    ).subscribe({
      next: () => {
        // Update the local array with new order indices
        this.ceremonyQuestions = questions.map((question, index) => ({
          ...question,
          order_index: index + 1
        }));
        
        this.snackBar.open('Question order updated successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error reordering questions:', error);
        this.snackBar.open('Failed to reorder questions', 'Close', { duration: 3000 });
      }
    });
  }

  removeQuestion(ceremonyQuestion: CeremonyQuestion): void {
    if (confirm('Are you sure you want to remove this question from the ceremony?')) {
      this.ceremoniesService.removeQuestionFromCeremony(
        ceremonyQuestion.ceremony_id, 
        ceremonyQuestion.question_id
      ).subscribe({
        next: () => {
          this.ceremonyQuestions = this.ceremonyQuestions.filter(
            cq => cq.id !== ceremonyQuestion.id
          );
          this.snackBar.open('Question removed successfully!', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error removing question:', error);
          this.snackBar.open('Failed to remove question', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    if (this.ceremony) {
      this.router.navigate(['/ceremonies', this.ceremony.id]);
    } else {
      this.router.navigate(['/ceremonies']);
    }
  }
}
