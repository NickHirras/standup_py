import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Ceremony {
  id: number;
  name: string;
  description?: string;
  team_id: number;
  cadence: string;
  start_time: string;
  timezone: string;
  send_notifications: boolean;
  notification_lead_time: number;
  chat_notifications_enabled: boolean;
  chat_webhook_url?: string;
  is_active: boolean;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface CeremonyCreate {
  name: string;
  description?: string;
  team_id: number;
  cadence: string;
  start_time: string;
  timezone: string;
  send_notifications: boolean;
  notification_lead_time: number;
  chat_notifications_enabled: boolean;
  chat_webhook_url?: string;
}

export interface CeremonyUpdate {
  name?: string;
  description?: string;
  cadence?: string;
  start_time?: string;
  timezone?: string;
  send_notifications?: boolean;
  notification_lead_time?: number;
  chat_notifications_enabled?: boolean;
  chat_webhook_url?: string;
  is_active?: boolean;
  status?: string;
}

export interface CeremonyQuestion {
  id: number;
  ceremony_id: number;
  question_id: number;
  order_index: number;
  is_required: boolean;
  created_at: string;
  question?: Question; // Full question details when loaded
}

export interface CeremonyQuestionCreate {
  ceremony_id: number;
  question_id: number;
  order_index: number;
  is_required: boolean;
}

export interface Question {
  id: number;
  text: string;
  question_type: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  validation_rules?: any;
  options?: QuestionOption[];
  grid_columns?: any;
  grid_rows?: any;
  min_value?: number;
  max_value?: number;
  min_label?: string;
  max_label?: string;
  allowed_file_types?: string[];
  max_file_size?: number;
  created_at: string;
  updated_at?: string;
}

export interface QuestionOption {
  id: number;
  question_id: number;
  text: string;
  value: string;
  order_index: number;
  is_correct: boolean;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  is_active: boolean;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CeremoniesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all ceremonies
  getCeremonies(): Observable<Ceremony[]> {
    return this.http.get<Ceremony[]>(`${this.apiUrl}/ceremonies/`);
  }

  // Get ceremony by ID
  getCeremony(id: number): Observable<Ceremony> {
    return this.http.get<Ceremony>(`${this.apiUrl}/ceremonies/${id}`);
  }

  // Create new ceremony
  createCeremony(ceremony: CeremonyCreate): Observable<Ceremony> {
    return this.http.post<Ceremony>(`${this.apiUrl}/ceremonies/`, ceremony);
  }

  // Update ceremony
  updateCeremony(id: number, ceremony: CeremonyUpdate): Observable<Ceremony> {
    return this.http.put<Ceremony>(`${this.apiUrl}/ceremonies/${id}`, ceremony);
  }

  // Delete ceremony
  deleteCeremony(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ceremonies/${id}`);
  }

  // Activate/deactivate ceremony
  toggleCeremonyStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ceremonies/${id}/activate`, {});
  }

  // Update ceremony status
  updateCeremonyStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ceremonies/${id}/status?status=${status}`, {});
  }

  // Get ceremony questions
  getCeremonyQuestions(ceremonyId: number): Observable<CeremonyQuestion[]> {
    return this.http.get<CeremonyQuestion[]>(`${this.apiUrl}/ceremonies/${ceremonyId}/questions`);
  }

  // Add question to ceremony
  addQuestionToCeremony(ceremonyId: number, questionData: CeremonyQuestionCreate): Observable<CeremonyQuestion> {
    return this.http.post<CeremonyQuestion>(`${this.apiUrl}/ceremonies/${ceremonyId}/questions`, questionData);
  }

  // Update ceremony question
  updateCeremonyQuestion(ceremonyId: number, questionId: number, questionData: CeremonyQuestionCreate): Observable<CeremonyQuestion> {
    return this.http.put<CeremonyQuestion>(`${this.apiUrl}/ceremonies/${ceremonyId}/questions/${questionId}`, questionData);
  }

  // Remove question from ceremony
  removeQuestionFromCeremony(ceremonyId: number, questionId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ceremonies/${ceremonyId}/questions/${questionId}`);
  }

  // Reorder ceremony questions
  reorderCeremonyQuestions(ceremonyId: number, questionOrders: Array<{question_id: number, order_index: number}>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ceremonies/${ceremonyId}/questions/reorder`, questionOrders);
  }

  // Get available questions (for adding to ceremonies)
  getAvailableQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions/`);
  }

  // Create new question
  createQuestion(question: any): Observable<Question> {
    return this.http.post<Question>(`${this.apiUrl}/questions/`, question);
  }

  // Update question
  updateQuestion(id: number, question: any): Observable<Question> {
    return this.http.put<Question>(`${this.apiUrl}/questions/${id}`, question);
  }

  // Delete question
  deleteQuestion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/questions/${id}`);
  }

  // Create question option
  createQuestionOption(questionId: number, optionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/questions/${questionId}/options`, optionData);
  }
}
