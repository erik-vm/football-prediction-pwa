import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { signal } from '@angular/core';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TokenResponse } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockTokenResponse: ApiResponse<TokenResponse> = {
    success: true,
    data: {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    },
    message: 'Registration successful'
  };

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['register', 'clearError'], {
      isLoading: signal(false),
      error: signal(null)
    });
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate username is required and minimum length', () => {
    const username = component.registerForm.get('username');

    expect(username?.hasError('required')).toBeTruthy();

    username?.setValue('ab');
    expect(username?.hasError('minlength')).toBeTruthy();

    username?.setValue('validuser');
    expect(username?.hasError('required')).toBeFalsy();
    expect(username?.hasError('minlength')).toBeFalsy();
  });

  it('should validate username pattern', () => {
    const username = component.registerForm.get('username');

    username?.setValue('invalid user!');
    expect(username?.hasError('pattern')).toBeTruthy();

    username?.setValue('valid_user-123');
    expect(username?.hasError('pattern')).toBeFalsy();
  });

  it('should validate email is required and valid', () => {
    const email = component.registerForm.get('email');

    expect(email?.hasError('required')).toBeTruthy();

    email?.setValue('invalidemail');
    expect(email?.hasError('email')).toBeTruthy();

    email?.setValue('valid@example.com');
    expect(email?.hasError('required')).toBeFalsy();
    expect(email?.hasError('email')).toBeFalsy();
  });

  it('should validate password is required and minimum length', () => {
    const password = component.registerForm.get('password');

    expect(password?.hasError('required')).toBeTruthy();

    password?.setValue('12345');
    expect(password?.hasError('minlength')).toBeTruthy();

    password?.setValue('123456');
    expect(password?.hasError('required')).toBeFalsy();
    expect(password?.hasError('minlength')).toBeFalsy();
  });

  it('should validate password confirmation is required', () => {
    const confirmPassword = component.registerForm.get('confirmPassword');
    expect(confirmPassword?.hasError('required')).toBeTruthy();
  });

  it('should validate passwords match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.registerForm.errors).toBeNull();
    expect(component.passwordsMatch).toBeTruthy();
  });

  it('should invalidate when passwords do not match', () => {
    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'different456'
    });

    expect(component.registerForm.errors?.['passwordMismatch']).toBeTruthy();
    expect(component.passwordsMatch).toBeFalsy();
  });

  it('should call authService.register on valid form submission', () => {
    authServiceSpy.register.and.returnValue(of(mockTokenResponse));

    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should not call authService.register on invalid form submission', () => {
    component.registerForm.setValue({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should navigate to home on successful registration', () => {
    authServiceSpy.register.and.returnValue(of(mockTokenResponse));

    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    component.onSubmit();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle registration error', () => {
    const errorResponse = { error: { message: 'Username already exists' } };
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.setValue({
      username: 'existinguser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    spyOn(console, 'error');
    component.onSubmit();

    expect(console.error).toHaveBeenCalledWith('Registration failed:', errorResponse);
  });

  it('should clear errors on init', () => {
    expect(authServiceSpy.clearError).toHaveBeenCalled();
  });

  it('should mark all fields as touched when form is invalid on submit', () => {
    component.registerForm.setValue({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });

    component.onSubmit();

    expect(component.registerForm.get('username')?.touched).toBeTruthy();
    expect(component.registerForm.get('email')?.touched).toBeTruthy();
    expect(component.registerForm.get('password')?.touched).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')?.touched).toBeTruthy();
  });

  it('should provide username getter', () => {
    const control = component.username;
    expect(control).toBe(component.registerForm.get('username'));
  });

  it('should provide email getter', () => {
    const control = component.email;
    expect(control).toBe(component.registerForm.get('email'));
  });

  it('should provide password getter', () => {
    const control = component.password;
    expect(control).toBe(component.registerForm.get('password'));
  });

  it('should provide confirmPassword getter', () => {
    const control = component.confirmPassword;
    expect(control).toBe(component.registerForm.get('confirmPassword'));
  });

  it('should not submit when passwords do not match', () => {
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different456'
    });

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should validate username max length', () => {
    const username = component.registerForm.get('username');
    const longUsername = 'a'.repeat(51);

    username?.setValue(longUsername);
    expect(username?.hasError('maxlength')).toBeTruthy();

    username?.setValue('a'.repeat(50));
    expect(username?.hasError('maxlength')).toBeFalsy();
  });

  it('should validate password max length', () => {
    const password = component.registerForm.get('password');
    const longPassword = 'a'.repeat(101);

    password?.setValue(longPassword);
    expect(password?.hasError('maxlength')).toBeTruthy();

    password?.setValue('a'.repeat(100));
    expect(password?.hasError('maxlength')).toBeFalsy();
  });
});
