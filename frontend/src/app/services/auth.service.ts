import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  company_id: number;
  timezone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.getUserFromStorage()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    console.log('AuthService.login called with:', loginData);
    console.log('Making request to:', `${this.apiUrl}/auth/login`);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData)
      .pipe(map(response => {
        console.log('Login response received:', response);
        // Store token
        localStorage.setItem('access_token', response.access_token);
        
        // Get user info and store
        this.getUserInfo().subscribe(user => {
          console.log('User info received:', user);
          localStorage.setItem('current_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        });
        
        return response;
      }));
  }

  logout(): Observable<any> {
    // Call the backend logout endpoint first
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        // Clear local storage and update user state
        localStorage.removeItem('access_token');
        localStorage.removeItem('current_user');
        this.currentUserSubject.next(null);
        console.log('User logged out successfully');
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  isAdmin(): boolean {
    const user = this.currentUserValue;
    return user?.role === 'admin';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getUserInfo(): Observable<User> {
    console.log('Getting user info from:', `${this.apiUrl}/auth/me`);
    const token = this.getToken();
    console.log('Using token:', token ? token.substring(0, 20) + '...' : 'No token');
    
    return this.http.get<User>(`${this.apiUrl}/auth/me`);
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  refreshToken(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/refresh`, {});
  }
}
