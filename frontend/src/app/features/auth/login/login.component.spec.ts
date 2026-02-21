import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TokenResponse } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockTokenResponse: ApiResponse<TokenResponse> = {
    success: true,
    data: {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    },
    message: 'Login successful'
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'clearError'], {
      isLoading: signal(false),
      error: signal(null)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub = {
      snapshot: {
        queryParams: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('usernameOrEmail')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate usernameOrEmail is required', () => {
    const usernameOrEmail = component.loginForm.get('usernameOrEmail');
    expect(usernameOrEmail?.hasError('required')).toBeTruthy();

    usernameOrEmail?.setValue('ab');
    expect(usernameOrEmail?.hasError('minlength')).toBeTruthy();

    usernameOrEmail?.setValue('validuser');
    expect(usernameOrEmail?.hasError('required')).toBeFalsy();
    expect(usernameOrEmail?.hasError('minlength')).toBeFalsy();
  });

  it('should validate password is required and minimum length', () => {
    const password = component.loginForm.get('password');
    expect(password?.hasError('required')).toBeTruthy();

    password?.setValue('12345');
    expect(password?.hasError('minlength')).toBeTruthy();

    password?.setValue('123456');
    expect(password?.hasError('required')).toBeFalsy();
    expect(password?.hasError('minlength')).toBeFalsy();
  });

  it('should call authService.login on valid form submission', () => {
    authServiceSpy.login.and.returnValue(of(mockTokenResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      usernameOrEmail: 'testuser',
      password: 'password123'
    });
  });

  it('should not call authService.login on invalid form submission', () => {
    component.loginForm.setValue({
      usernameOrEmail: '',
      password: ''
    });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should navigate to home on successful login', () => {
    authServiceSpy.login.and.returnValue(of(mockTokenResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate to returnUrl on successful login when returnUrl is set', () => {
    activatedRoute.snapshot.queryParams['returnUrl'] = '/predictions';
    component.ngOnInit();

    authServiceSpy.login.and.returnValue(of(mockTokenResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/predictions']);
  });

  it('should handle login error', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.loginForm.setValue({
      usernameOrEmail: 'testuser',
      password: 'wrongpassword'
    });

    spyOn(console, 'error');
    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith('Login failed:', errorResponse);
  });

  it('should clear errors on init', () => {
    expect(authServiceSpy.clearError).toHaveBeenCalled();
  });

  it('should mark all fields as touched when form is invalid on submit', () => {
    component.loginForm.setValue({
      usernameOrEmail: '',
      password: ''
    });

    component.onSubmit();

    expect(component.loginForm.get('usernameOrEmail')?.touched).toBeTruthy();
    expect(component.loginForm.get('password')?.touched).toBeTruthy();
  });

  it('should provide usernameOrEmail getter', () => {
    const control = component.usernameOrEmail;
    expect(control).toBe(component.loginForm.get('usernameOrEmail'));
  });

  it('should provide password getter', () => {
    const control = component.password;
    expect(control).toBe(component.loginForm.get('password'));
  });
});
