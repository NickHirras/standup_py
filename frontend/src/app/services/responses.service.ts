import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface QuestionResponseData {
  question_id: number;
  text_response?: string;
  selected_options?: string[];
  numeric_response?: number;
  date_response?: string;
  time_response?: string;
  file_upload?: any;
}

export interface CeremonyResponseCreate {
  ceremony_id: number;
  team_id: number;
  question_responses: QuestionResponseData[];
  notes?: string;
  mood_rating?: number;
  energy_level?: number;
}

export interface CeremonyResponseUpdate {
  question_responses?: QuestionResponseData[];
  notes?: string;
  mood_rating?: number;
  energy_level?: number;
  status?: string;
}

export interface QuestionResponseResponse {
  id: number;
  question_id: number;
  text_response?: string;
  selected_options?: string[];
  numeric_response?: number;
  date_response?: string;
  time_response?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  response_time: string;
  is_required: boolean;
  validation_errors?: any;
}

export interface CeremonyResponseResponse {
  id: number;
  ceremony_id: number;
  user_id: number;
  team_id: number;
  submitted_at: string;
  completed_at?: string;
  is_complete: boolean;
  status: string;
  notes?: string;
  mood_rating?: number;
  energy_level?: number;
  question_responses: QuestionResponseResponse[];
}

export interface CeremonyResponseList {
  id: number;
  ceremony_id: number;
  user_id: number;
  team_id: number;
  submitted_at: string;
  completed_at?: string;
  is_complete: boolean;
  status: string;
  notes?: string;
  mood_rating?: number;
  energy_level?: number;
  question_responses_count: number;
}

export interface ResponseSummary {
  ceremony_id: number;
  total_responses: number;
  completion_rate: number;
  average_mood?: number;
  average_energy?: number;
  question_summaries: QuestionResponseSummary[];
}

export interface QuestionResponseSummary {
  question_id: number;
  question_text: string;
  question_type: string;
  total_responses: number;
  response_summary: any;
  completion_rate: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResponsesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Create a new ceremony response
  createCeremonyResponse(responseData: CeremonyResponseCreate): Observable<CeremonyResponseResponse> {
    return this.http.post<CeremonyResponseResponse>(`${this.apiUrl}/responses/`, responseData);
  }

  // Get all responses for a specific ceremony
  getCeremonyResponses(ceremonyId: number, status?: string): Observable<CeremonyResponseList[]> {
    let url = `${this.apiUrl}/responses/ceremony/${ceremonyId}`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<CeremonyResponseList[]>(url);
  }

  // Get a specific ceremony response
  getCeremonyResponse(responseId: number): Observable<CeremonyResponseResponse> {
    return this.http.get<CeremonyResponseResponse>(`${this.apiUrl}/responses/${responseId}`);
  }

  // Update a ceremony response
  updateCeremonyResponse(responseId: number, responseData: CeremonyResponseUpdate): Observable<CeremonyResponseResponse> {
    return this.http.put<CeremonyResponseResponse>(`${this.apiUrl}/responses/${responseId}`, responseData);
  }

  // Delete a ceremony response
  deleteCeremonyResponse(responseId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/responses/${responseId}`);
  }

  // Get response summary for a ceremony
  getCeremonyResponseSummary(ceremonyId: number): Observable<ResponseSummary> {
    return this.http.get<ResponseSummary>(`${this.apiUrl}/responses/ceremony/${ceremonyId}/summary`);
  }

  // Get all responses for the current user
  getUserResponses(status?: string): Observable<CeremonyResponseList[]> {
    let url = `${this.apiUrl}/responses/user/me`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<CeremonyResponseList[]>(url);
  }

  // Get all responses for a specific team
  getTeamResponses(teamId: number, ceremonyId?: number, status?: string): Observable<CeremonyResponseList[]> {
    let url = `${this.apiUrl}/responses/team/${teamId}`;
    const params: string[] = [];
    
    if (ceremonyId) {
      params.push(`ceremony_id=${ceremonyId}`);
    }
    if (status) {
      params.push(`status=${status}`);
    }
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get<CeremonyResponseList[]>(url);
  }

  // Helper method to format date for API
  formatDateForAPI(date: Date): string {
    return date.toISOString();
  }

  // Helper method to validate response data
  validateResponseData(responseData: CeremonyResponseCreate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!responseData.ceremony_id) {
      errors.push('Ceremony ID is required');
    }

    if (!responseData.team_id) {
      errors.push('Team ID is required');
    }

    if (!responseData.question_responses || responseData.question_responses.length === 0) {
      errors.push('At least one question response is required');
    }

    // Validate mood and energy ratings
    if (responseData.mood_rating !== undefined && (responseData.mood_rating < 1 || responseData.mood_rating > 10)) {
      errors.push('Mood rating must be between 1 and 10');
    }

    if (responseData.energy_level !== undefined && (responseData.energy_level < 1 || responseData.energy_level > 10)) {
      errors.push('Energy level must be between 1 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Helper method to get response status display text
  getStatusDisplayText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'completed': 'Completed',
      'archived': 'Archived'
    };
    return statusMap[status] || status;
  }

  // Helper method to get response status color
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'draft': 'warn',
      'submitted': 'primary',
      'completed': 'accent',
      'archived': 'default'
    };
    return colorMap[status] || 'default';
  }
}
