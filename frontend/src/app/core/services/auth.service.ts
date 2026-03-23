import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';

  private currentUser = signal<AuthResponse | null>(null);

  isAuthenticated = computed(() => !!this.currentUser());
  user = computed(() => this.currentUser());

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const user = this.storage.getJson<AuthResponse>(this.USER_KEY);
    const token = this.storage.get(this.TOKEN_KEY);
    if (user && token) {
      this.currentUser.set(user);
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', request).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.storage.get(this.REFRESH_KEY);
    return this.api.post<AuthResponse>('/auth/refresh', { refreshToken }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    this.storage.remove(this.TOKEN_KEY);
    this.storage.remove(this.REFRESH_KEY);
    this.storage.remove(this.USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.storage.get(this.TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    this.storage.set(this.TOKEN_KEY, response.accessToken);
    this.storage.set(this.REFRESH_KEY, response.refreshToken);
    this.storage.setJson(this.USER_KEY, response);
    this.currentUser.set(response);
  }
}
