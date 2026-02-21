import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest, TokenResponse } from './auth.service';
import { environment } from '../../../environments/environment';
import { UserRole } from '../models/user.model';
import { ApiResponse } from '../models/api-response.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockTokenResponse: TokenResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoidGVzdHVzZXIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiVXNlciJ9.test',
    refreshToken: 'refresh-token-123',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  };

  const mockAdminTokenResponse: TokenResponse = {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYWRtaW51c2VyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiJ9.test',
    refreshToken: 'refresh-token-456',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  };

  beforeEach(() => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and store tokens', (done) => {
      const loginRequest: LoginRequest = {
        usernameOrEmail: 'testuser',
        password: 'password123'
      };

      const apiResponse: ApiResponse<TokenResponse> = {
        success: true,
        data: mockTokenResponse,
        message: 'Login successful'
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(response.data).toEqual(mockTokenResponse);
          expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.accessToken);
          expect(localStorage.getItem('refresh_token')).toBe(mockTokenResponse.refreshToken);
          expect(service.isAuthenticated()).toBe(true);
          expect(service.currentUser()?.username).toBe('testuser');
          expect(service.currentUser()?.email).toBe('test@example.com');
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(apiResponse);
    });

    it('should handle login error', (done) => {
      const loginRequest: LoginRequest = {
        usernameOrEmail: 'testuser',
        password: 'wrongpassword'
      };

      const errorResponse = {
        error: { message: 'Invalid credentials' }
      };

      service.login(loginRequest).subscribe({
        error: (error) => {
          expect(service.error()).toBe('Invalid credentials');
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should register successfully and store tokens', (done) => {
      const registerRequest: RegisterRequest = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const apiResponse: ApiResponse<TokenResponse> = {
        success: true,
        data: mockTokenResponse,
        message: 'Registration successful'
      };

      service.register(registerRequest).subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.accessToken);
          expect(service.isAuthenticated()).toBe(true);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerRequest);
      req.flush(apiResponse);
    });

    it('should handle registration error', (done) => {
      const registerRequest: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      };

      const errorResponse = {
        error: { message: 'Username already exists' }
      };

      service.register(registerRequest).subscribe({
        error: (error) => {
          expect(service.error()).toBe('Username already exists');
          expect(service.isAuthenticated()).toBe(false);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('logout', () => {
    it('should clear tokens and user state', () => {
      localStorage.setItem('access_token', mockTokenResponse.accessToken);
      localStorage.setItem('refresh_token', mockTokenResponse.refreshToken);
      service['currentUserSignal'].set({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER
      });

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', (done) => {
      localStorage.setItem('refresh_token', 'old-refresh-token');

      const apiResponse: ApiResponse<TokenResponse> = {
        success: true,
        data: mockTokenResponse,
        message: 'Token refreshed'
      };

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response.success).toBe(true);
          expect(localStorage.getItem('access_token')).toBe(mockTokenResponse.accessToken);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'old-refresh-token' });
      req.flush(apiResponse);
    });

    it('should logout if no refresh token available', (done) => {
      service.refreshToken().subscribe({
        error: (error) => {
          expect(error.message).toBe('No refresh token available');
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });

    it('should logout on refresh token error', (done) => {
      localStorage.setItem('refresh_token', 'invalid-token');

      service.refreshToken().subscribe({
        error: () => {
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh`);
      req.flush({ error: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', (done) => {
      const apiResponse: ApiResponse<TokenResponse> = {
        success: true,
        data: mockAdminTokenResponse,
        message: 'Login successful'
      };

      const loginRequest: LoginRequest = {
        usernameOrEmail: 'admin',
        password: 'admin123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          expect(service.isAdmin()).toBe(true);
          expect(service.currentUser()?.role).toBe(UserRole.ADMIN);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(apiResponse);
    });

    it('should return false for regular user', (done) => {
      const apiResponse: ApiResponse<TokenResponse> = {
        success: true,
        data: mockTokenResponse,
        message: 'Login successful'
      };

      const loginRequest: LoginRequest = {
        usernameOrEmail: 'user',
        password: 'user123'
      };

      service.login(loginRequest).subscribe({
        next: () => {
          expect(service.isAdmin()).toBe(false);
          expect(service.currentUser()?.role).toBe(UserRole.USER);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(apiResponse);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      service['errorSignal'].set('Some error');
      expect(service.error()).toBe('Some error');

      service.clearError();
      expect(service.error()).toBeNull();
    });
  });

  describe('loadUserFromToken', () => {
    it('should load user from valid token in localStorage', () => {
      localStorage.setItem('access_token', mockTokenResponse.accessToken);

      const newService = TestBed.inject(AuthService);

      expect(newService.isAuthenticated()).toBe(true);
      expect(newService.currentUser()?.username).toBe('testuser');
    });

    it('should logout if token is invalid', () => {
      localStorage.setItem('access_token', 'invalid.token.here');

      const newService = TestBed.inject(AuthService);

      expect(newService.isAuthenticated()).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
