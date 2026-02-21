import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals for reactive state
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  currentUser = this.currentUserSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === UserRole.ADMIN);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  login(request: LoginRequest): Observable<ApiResponse<TokenResponse>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap(response => {
        if (response.data) {
          this.handleAuthSuccess(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<TokenResponse>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/register`, request).pipe(
      tap(response => {
        if (response.data) {
          this.handleAuthSuccess(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.handleAuthError(error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<ApiResponse<TokenResponse>> {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<TokenResponse>>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.data) {
          this.handleAuthSuccess(response.data);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(tokenResponse: TokenResponse): void {
    localStorage.setItem('access_token', tokenResponse.accessToken);
    localStorage.setItem('refresh_token', tokenResponse.refreshToken);

    const user = this.decodeToken(tokenResponse.accessToken);
    this.currentUserSignal.set(user);
  }

  private handleAuthError(error: any): void {
    const errorMessage = error.error?.message || error.message || 'Authentication failed';
    this.errorSignal.set(errorMessage);
    this.isLoadingSignal.set(false);
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        const user = this.decodeToken(token);
        this.currentUserSignal.set(user);
      } catch (e) {
        console.error('Invalid token, clearing auth state', e);
        this.logout();
      }
    }
  }

  private decodeToken(token: string): User {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub,
      username: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name,
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
      role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'Admin'
        ? UserRole.ADMIN
        : UserRole.USER
    };
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
