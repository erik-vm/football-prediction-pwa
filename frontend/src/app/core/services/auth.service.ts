import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  isAuthenticated = signal<boolean>(this.hasAccessToken());
  currentUser = signal<any>(this.storage.getObject(this.USER_KEY));

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    return this.api.post<AuthResponse>('auth/refresh', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.storage.removeItem(this.ACCESS_TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.storage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  getAccessToken(): string | null {
    return this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.storage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    this.storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this.storage.setObject(this.USER_KEY, {
      userId: response.userId,
      username: response.username,
      email: response.email,
      isAdmin: response.isAdmin
    });
    this.isAuthenticated.set(true);
    this.currentUser.set({
      userId: response.userId,
      username: response.username,
      email: response.email,
      isAdmin: response.isAdmin
    });
  }

  private hasAccessToken(): boolean {
    return !!this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }
}
