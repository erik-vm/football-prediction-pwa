# Frontend Agent Guide - Football Prediction PWA

**Technology Stack:** Angular 19, TypeScript 5.7, Tailwind CSS v3, PWA
**Last Updated:** 2026-02-21
**Current Phase:** Phase 8 Complete - Authentication UI

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture](#architecture)
3. [Angular 19 Patterns](#angular-19-patterns)
4. [Tailwind CSS Configuration](#tailwind-css-configuration)
5. [HTTP Interceptors](#http-interceptors)
6. [Route Guards](#route-guards)
7. [State Management](#state-management)
8. [Angular Signals](#angular-signals)
9. [Reactive Forms](#reactive-forms)
10. [Best Practices](#best-practices)
11. [Common Issues](#common-issues)

---

## Project Setup

### Prerequisites

- Node.js v22+ (verified v22.19.0)
- npm v11+ (verified 11.6.2)
- Angular CLI 19 (install globally: `npm install -g @angular/cli@19`)

### Creating New Angular 19 Application

```bash
npx @angular/cli@19 new <app-name> --routing --style=scss --standalone --skip-git --package-manager=npm
```

**Flags Explained:**
- `--routing`: Adds Angular Router
- `--style=scss`: Use SCSS instead of CSS
- `--standalone`: Use standalone components (no NgModules) - **Angular 19 default**
- `--skip-git`: Don't create separate git repo
- `--package-manager=npm`: Use npm (not yarn/pnpm)

**Result:**
- Angular 19.2.20
- TypeScript 5.7
- Vite-based build system (fast!)
- Standalone components architecture

---

## Architecture

### Folder Structure (Clean Architecture)

```
frontend/src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── admin.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   └── api-response.model.ts
│   └── services/
│       └── auth.service.ts
├── shared/                  # Reusable components, directives, pipes
│   ├── components/
│   ├── directives/
│   └── pipes/
└── features/                # Feature modules (lazy-loaded)
    ├── auth/
    ├── tournaments/
    ├── predictions/
    └── leaderboard/
```

### Layer Responsibilities

#### 1. **core/** - Application Core
- **Purpose**: Singleton services used throughout the app
- **When to use**: Guards, interceptors, API services, authentication
- **Import**: Only once in `app.config.ts`
- **Example**: `AuthService`, `authGuard`, `authInterceptor`

#### 2. **shared/** - Shared Components
- **Purpose**: Reusable UI components, directives, pipes
- **When to use**: Components used by multiple features
- **Import**: By multiple feature modules
- **Example**: `ButtonComponent`, `LoadingSpinnerComponent`, `DatePipe`

#### 3. **features/** - Feature Modules
- **Purpose**: Self-contained features
- **When to use**: Major application features
- **Import**: Lazy-loaded via routing
- **Example**: `auth`, `tournaments`, `predictions`

---

## Angular 19 Patterns

### Standalone Components (Angular 19 Default)

**DO** use standalone components (no NgModules):

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,                    // ✅ Standalone component
  imports: [CommonModule, RouterModule], // ✅ Import dependencies directly
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
```

**DON'T** create NgModules (old pattern):

```typescript
// ❌ WRONG - Don't use NgModules in Angular 19
@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule],
  exports: [HomeComponent]
})
export class HomeModule {}
```

### Functional Dependency Injection

**DO** use `inject()` function in guards, interceptors, and services:

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);  // ✅ Functional DI
  // ...
};
```

**DON'T** use constructor injection in functional patterns:

```typescript
// ❌ WRONG - Can't use constructor injection in functions
export const authGuard: CanActivateFn = (route, state) => {
  constructor(private router: Router) {}  // ❌ Doesn't work
};
```

---

## Tailwind CSS Configuration

### Installation

**IMPORTANT:** Use Tailwind CSS v3, **NOT v4**

```bash
npm install -D tailwindcss@^3 postcss autoprefixer
```

**Why v3 and not v4?**
- Tailwind v4 has breaking PostCSS changes
- Incompatible with Angular's build system
- v3 is stable, production-ready, fully supported

### PostCSS Configuration

Create `postcss.config.js` in project root:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

### Tailwind Configuration

Create `tailwind.config.js` in project root:

```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",  // Scan all HTML and TypeScript files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

### Global Styles

Update `src/styles.scss`:

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Verification

After setup, build should work:

```bash
ng build
# Should complete without PostCSS errors
```

**Expected Bundle:**
- Main: ~200-250 kB (raw)
- Styles: ~5-10 kB (purged Tailwind)
- Total gzipped: ~60-80 kB

---

## HTTP Interceptors

### Functional Interceptor Pattern (Angular 19)

**New Pattern:** Use `HttpInterceptorFn` instead of class-based interceptors.

#### Auth Interceptor (JWT Token Injection)

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
```

**How it works:**
1. Check localStorage for JWT token
2. If token exists, clone request and add Authorization header
3. Pass cloned request to next handler
4. If no token, pass original request

#### Error Interceptor (Global Error Handling)

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);  // Functional DI

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('access_token');
        router.navigate(['/login']);
      }

      console.error('HTTP Error:', error);
      return throwError(() => error);
    })
  );
};
```

**How it works:**
1. Inject Router using `inject()` function
2. Catch HTTP errors using RxJS `catchError`
3. Handle 401 Unauthorized: clear token, redirect to login
4. Log error and rethrow for component handling

### Registration in App Config

Register interceptors in `app.config.ts`:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ]
};
```

**Execution Order:**
Interceptors run in the order provided: `authInterceptor` → `errorInterceptor`

---

## Route Guards

### Functional Guard Pattern (Angular 19)

**New Pattern:** Use `CanActivateFn` instead of class-based guards.

#### Auth Guard (Token Presence Check)

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (token) {
    return true;  // Allow navigation
  }

  // Redirect to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};
```

**How it works:**
1. Check if JWT token exists in localStorage
2. If exists: allow navigation (return true)
3. If not exists: redirect to login with returnUrl query parameter
4. User can be redirected back after login

#### Admin Guard (Role-Based Authorization)

```typescript
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    // Decode JWT payload (base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Extract role claim (ASP.NET Core format)
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (role === 'Admin') {
      return true;  // Allow access
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  router.navigate(['/']);  // Redirect home
  return false;
};
```

**How it works:**
1. Check if token exists
2. Decode JWT payload using `atob()` (base64 decode)
3. Extract role claim from payload
4. If role is 'Admin': allow access
5. If not admin or error: redirect to home

**JWT Decoding Explained:**
```
JWT format: header.payload.signature
Example: eyJ...(header).eyJ...(payload).SflK...(signature)

Steps:
1. token.split('.')[1] → Get payload part
2. atob() → Decode base64 to JSON string
3. JSON.parse() → Parse JSON to object
4. payload['role-claim-key'] → Extract role
```

**Security Note:**
- Frontend decoding is for **UI logic only**
- Backend **always validates** token on protected endpoints
- Never trust frontend validation for security decisions

### Usage in Routes

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'profile',
    canActivate: [authGuard],  // Requires authentication
    loadComponent: () => import('./features/profile/profile.component')
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],  // Requires auth + admin role
    loadComponent: () => import('./features/admin/admin.component')
  }
];
```

**Guard Execution Order:**
Guards run in array order. If `authGuard` returns false, `adminGuard` never runs.

---

## State Management

### Environment Configuration

Create separate configurations for development and production.

#### Development Environment

`src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api/v1',  // Local backend
  apiTimeout: 30000,  // 30 seconds
};
```

#### Production Environment

`src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: '/api/v1',  // Relative URL (same origin)
  apiTimeout: 30000,
};
```

#### Usage in Services

```typescript
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  getPredictions() {
    return this.http.get(`${this.apiUrl}/predictions`);
  }
}
```

---

## Angular Signals

### What Are Signals?

Angular Signals are a new reactive primitive introduced in Angular 16+ for managing state. They provide fine-grained reactivity with automatic change detection.

**Benefits over RxJS:**
- Simpler API
- Better performance (fine-grained updates)
- No memory leaks (no manual unsubscribe)
- Synchronous by default
- Built-in computed values

### Basic Signal Usage

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  // Writable signal
  count = signal(0);

  // Computed signal (readonly, auto-updates)
  double = computed(() => this.count() * 2);

  increment() {
    this.count.update(val => val + 1);  // Update
    // Or: this.count.set(5);  // Set directly
  }
}
```

**Template Usage:**
- Call signals like functions: `{{ count() }}`
- No async pipe needed
- Automatic change detection

### Signals in Services (AuthService Example)

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Private writable signals
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  currentUser = this.currentUserSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals (derived state)
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  login(credentials: LoginRequest) {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<TokenResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.currentUserSignal.set(this.decodeToken(response.accessToken));
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.message);
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }
}
```

### Using Signals in Components

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-header',
  template: `
    @if (isAuthenticated()) {
      <span>Welcome, {{ currentUser()?.username }}</span>
      <button (click)="logout()">Logout</button>
    } @else {
      <a routerLink="/login">Login</a>
    }
  `
})
export class HeaderComponent {
  private authService = inject(AuthService);

  // Expose signals to template
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  logout() {
    this.authService.logout();
  }
}
```

### Signal Methods

```typescript
// Create signal
const count = signal(0);

// Read value
console.log(count());  // 0

// Set value
count.set(5);

// Update value (based on current value)
count.update(val => val + 1);

// Computed signal (readonly)
const double = computed(() => count() * 2);

// Effect (runs when dependencies change)
effect(() => {
  console.log('Count changed:', count());
});
```

### Signals vs RxJS

| Feature | Signals | RxJS |
|---------|---------|------|
| **Syntax** | `count()` | `count$ \| async` |
| **Memory** | No leaks | Manual unsubscribe |
| **Performance** | Fine-grained | Zone-based |
| **Async** | Sync by default | Async by default |
| **Learning Curve** | Easy | Moderate |

**When to use Signals:**
- Component state
- Service state
- Derived/computed values
- Synchronous data

**When to use RxJS:**
- HTTP requests
- WebSocket streams
- Complex async pipelines
- Event handling

**Best Practice:** Combine both! Use RxJS for async operations, Signals for state.

---

## Reactive Forms

### Form Validation Patterns

Angular Reactive Forms provide powerful validation with built-in and custom validators.

### Basic Form with Validation

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" type="email" />
      @if (email?.invalid && email?.touched) {
        <p class="error">
          @if (email?.errors?.['required']) {
            Email is required
          }
          @if (email?.errors?.['email']) {
            Invalid email format
          }
        </p>
      }

      <input formControlName="password" type="password" />
      @if (password?.invalid && password?.touched) {
        <p class="error">
          @if (password?.errors?.['required']) {
            Password is required
          }
          @if (password?.errors?.['minlength']) {
            Must be at least 6 characters
          }
        </p>
      }

      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
```

### Built-in Validators

```typescript
import { Validators } from '@angular/forms';

this.form = this.fb.group({
  // Required field
  username: ['', Validators.required],

  // Email validation
  email: ['', [Validators.required, Validators.email]],

  // Min/max length
  password: ['', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(100)
  ]],

  // Pattern validation (regex)
  username: ['', [
    Validators.required,
    Validators.pattern(/^[a-zA-Z0-9_-]+$/)
  ]],

  // Min/max value (numbers)
  age: ['', [
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ]],

  // Multiple validators
  field: ['', [Validators.required, Validators.email, Validators.minLength(5)]]
});
```

### Custom Validators (Field-Level)

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Custom validator function
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;  // Don't validate empty values (use Validators.required)
    }

    const hasNumber = /[0-9]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    const valid = hasNumber && hasUpper && hasLower && hasSpecial;

    return valid ? null : { passwordStrength: true };
  };
}

// Usage
this.form = this.fb.group({
  password: ['', [
    Validators.required,
    Validators.minLength(8),
    passwordStrengthValidator()
  ]]
});
```

### Form-Level Validators (Cross-Field Validation)

```typescript
import { AbstractControl, ValidationErrors } from '@angular/forms';

// Password confirmation validator
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) {
    return null;
  }

  return password.value === confirmPassword.value
    ? null
    : { passwordMismatch: true };
}

// Usage
this.registerForm = this.fb.group({
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', [Validators.required]]
}, {
  validators: passwordMatchValidator  // ← Form-level validator
});

// Template
@if (!passwordsMatch && confirmPassword?.touched) {
  <p class="error">Passwords do not match</p>
}

// Component
get passwordsMatch(): boolean {
  return !this.registerForm.errors?.['passwordMismatch'];
}
```

### Form State Properties

```typescript
// Form validity
form.valid       // true if all controls valid
form.invalid     // true if any control invalid
form.pending     // true if async validation running

// Form interaction
form.touched     // true if user interacted
form.untouched   // true if user hasn't interacted
form.dirty       // true if value changed
form.pristine    // true if value hasn't changed

// Control-specific
control.errors   // Validation errors object
control.value    // Current value
control.status   // 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
```

### Dynamic Error Messages

```typescript
getErrorMessage(controlName: string): string {
  const control = this.form.get(controlName);

  if (control?.hasError('required')) {
    return `${controlName} is required`;
  }
  if (control?.hasError('email')) {
    return 'Invalid email format';
  }
  if (control?.hasError('minlength')) {
    const min = control.errors?.['minlength'].requiredLength;
    return `Must be at least ${min} characters`;
  }
  if (control?.hasError('pattern')) {
    return 'Invalid format';
  }

  return '';
}

// Template
<input formControlName="email" />
@if (email?.invalid && email?.touched) {
  <p class="error">{{ getErrorMessage('email') }}</p>
}
```

### Form Submission Best Practices

```typescript
onSubmit() {
  // Mark all fields as touched to show errors
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  // Disable form during submission
  this.form.disable();

  this.authService.login(this.form.value).subscribe({
    next: () => {
      this.router.navigate(['/dashboard']);
    },
    error: (error) => {
      this.form.enable();  // Re-enable on error
      this.errorMessage = error.message;
    }
  });
}
```

---

## Best Practices

### 1. Use Signals for Reactive State (Angular 19)

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  count = signal(0);  // Reactive state
  double = computed(() => this.count() * 2);  // Computed value

  increment() {
    this.count.update(val => val + 1);
  }
}
```

### 2. Lazy Load Feature Modules

```typescript
export const routes: Routes = [
  {
    path: 'tournaments',
    loadComponent: () => import('./features/tournaments/tournaments.component')
      .then(m => m.TournamentsComponent)
  }
];
```

### 3. Use Async Pipe for Observables

```typescript
// ✅ GOOD - Async pipe handles subscription
@Component({
  template: `<div *ngFor="let item of items$ | async">{{ item }}</div>`
})
export class ListComponent {
  items$ = this.http.get<Item[]>('/api/items');
}

// ❌ BAD - Manual subscription (memory leak risk)
@Component({
  template: `<div *ngFor="let item of items">{{ item }}</div>`
})
export class ListComponent implements OnInit, OnDestroy {
  items: Item[] = [];
  subscription!: Subscription;

  ngOnInit() {
    this.subscription = this.http.get<Item[]>('/api/items')
      .subscribe(items => this.items = items);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();  // Easy to forget!
  }
}
```

### 4. Type-Safe API Responses

```typescript
// Define response interface
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: string[];
}

// Use in service
getPredictions(): Observable<ApiResponse<Prediction[]>> {
  return this.http.get<ApiResponse<Prediction[]>>(`${this.apiUrl}/predictions`);
}
```

---

## Common Issues

### Issue #1: Tailwind CSS v4 PostCSS Error

**Error Message:**
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
The PostCSS plugin has moved to a separate package...
```

**Cause:**
Installed Tailwind v4 (next) which has breaking PostCSS changes.

**Solution:**
```bash
# Uninstall v4
npm uninstall tailwindcss @tailwindcss/postcss

# Install stable v3
npm install -D tailwindcss@^3 postcss autoprefixer

# Update postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},      // NOT '@tailwindcss/postcss'
    autoprefixer: {}
  }
};
```

**Prevention:**
Always specify `tailwindcss@^3` explicitly in package.json.

---

### Issue #2: Property Initialization with Injected Dependencies

**Error Message:**
```
TS2729: Property 'authService' is used before its initialization.
```

**Cause:**
Trying to access constructor-injected dependencies in property initializers. TypeScript strict mode doesn't allow this because properties are initialized before the constructor runs.

**Problem Code:**
```typescript
export class MyComponent {
  isLoading = this.authService.isLoading;  // ❌ Error!

  constructor(private authService: AuthService) {}  // Initialized after
}
```

**Solution:**
Use Angular's `inject()` function instead:

```typescript
import { Component, inject } from '@angular/core';

export class MyComponent {
  private authService = inject(AuthService);  // ✅ Works!

  isLoading = this.authService.isLoading;    // ✅ Now this works
  error = this.authService.error;            // ✅ Works too
}
```

**Why This Works:**
- `inject()` can be called during field initialization
- Fields are initialized top-to-bottom
- `authService` is initialized before `isLoading`

**When to Use:**
- Accessing injected dependencies in property initializers
- Accessing signals from services in component properties
- Prefer functional style over constructor injection

**Alternative Solution (ngOnInit):**
```typescript
export class MyComponent implements OnInit {
  isLoading!: boolean;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = this.authService.isLoading;  // Initialize here
  }
}
```

---

### Issue #3: Interceptor Not Adding Token

**Symptom:**
API requests return 401 even though token exists in localStorage.

**Possible Causes:**
1. Interceptor not registered in `app.config.ts`
2. Token stored with wrong key (check: `access_token`)
3. Token expired (check expiration in JWT payload)
4. CORS issue (backend not accepting Authorization header)

**Debug Steps:**
```typescript
// Add logging to interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  console.log('Token:', token);  // Debug: check token value

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Headers:', cloned.headers.get('Authorization'));  // Debug
    return next(cloned);
  }

  return next(req);
};
```

---

### Issue #3: Guards Not Preventing Navigation

**Symptom:**
Users can access protected routes without being logged in.

**Possible Causes:**
1. Guard not added to route configuration
2. Guard returning `true` when it should return `false`
3. Multiple guards with wrong execution order

**Solution:**
```typescript
// ✅ CORRECT - Guard registered
{
  path: 'profile',
  canActivate: [authGuard],  // ← Must be here
  component: ProfileComponent
}

// ❌ WRONG - No guard
{
  path: 'profile',
  component: ProfileComponent  // Anyone can access
}
```

---

### Issue #4: Environment Configuration Not Working

**Symptom:**
`environment.apiUrl` is undefined or using wrong value.

**Possible Causes:**
1. Environment files not created
2. Wrong import path
3. Angular not using correct environment file

**Solution:**
```typescript
// ✅ CORRECT - Import from relative path
import { environment } from '../../environments/environment';

// ❌ WRONG - Absolute import won't work
import { environment } from '@environments/environment';
```

**Build Configuration:**
Angular automatically uses `environment.prod.ts` for production builds (`ng build`).

---

### Issue #5: Large Bundle Size

**Symptom:**
Initial bundle > 500 kB, slow load times.

**Solutions:**
1. **Enable Lazy Loading:**
   ```typescript
   {
     path: 'feature',
     loadComponent: () => import('./feature/feature.component')
   }
   ```

2. **Check Tailwind Purging:**
   ```javascript
   // tailwind.config.js
   content: ["./src/**/*.{html,ts}"],  // Must include all template files
   ```

3. **Analyze Bundle:**
   ```bash
   ng build --stats-json
   npx webpack-bundle-analyzer dist/frontend/stats.json
   ```

---

## PWA Configuration

### Service Worker Setup

**Installation:**
```bash
ng add @angular/pwa
```

**Configuration in app.config.ts:**
```typescript
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,  // Only in production
      registrationStrategy: 'registerWhenStable:30000'  // Register after 30s
    })
  ]
};
```

**Files Created:**
- `ngsw-config.json` - Service worker configuration
- `public/manifest.webmanifest` - PWA manifest
- `public/icons/*.png` - App icons

**Testing PWA:**
```bash
# Build production bundle
ng build

# Serve with http-server (supports service workers)
npx http-server -p 8080 -c-1 dist/frontend/browser
```

---

## Testing Patterns

### Component Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]  // Standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Guard Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });
    router = TestBed.inject(Router);
  });

  it('should allow access when token exists', () => {
    localStorage.setItem('access_token', 'fake-token');

    const result = authGuard(null as any, { url: '/profile' } as any);

    expect(result).toBe(true);
  });

  it('should redirect to login when no token', () => {
    localStorage.removeItem('access_token');

    const result = authGuard(null as any, { url: '/profile' } as any);

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/profile' }
    });
  });
});
```

---

## Performance Guidelines

### Bundle Size Targets

| Bundle | Size (Raw) | Size (Gzipped) | Status |
|--------|-----------|----------------|--------|
| Initial Total | < 300 kB | < 100 kB | ✅ Good |
| Initial Total | 300-500 kB | 100-150 kB | ⚠️ Warning |
| Initial Total | > 500 kB | > 150 kB | ❌ Too large |

### Build Time Targets

| Build Type | Time | Status |
|------------|------|--------|
| Development (ng serve) | < 5s | ✅ Good |
| Production (ng build) | < 30s | ✅ Good |
| Production (ng build) | > 60s | ⚠️ Slow |

### Optimization Checklist

- [x] Lazy load feature modules
- [x] Use OnPush change detection strategy
- [x] Minimize bundle size with tree shaking
- [x] Enable production mode (`ng build`)
- [x] Use async pipe for observables
- [x] Purge unused Tailwind CSS classes
- [x] Enable gzip compression on server

---

## Summary

**Phase 7 (Frontend Foundation) established:**
- ✅ Angular 19 with standalone components
- ✅ Tailwind CSS v3 (stable, working)
- ✅ Functional interceptors (auth, error)
- ✅ Functional guards (auth, admin)
- ✅ PWA service worker
- ✅ Environment configuration
- ✅ Clean Architecture structure

**Next Steps (Phase 8 - Authentication UI):**
- Create login/register components
- Implement AuthService with Signals
- Add form validation
- Handle authentication errors
- Persist user state

**This guide will be updated as new patterns are discovered in future phases.**

---

**Last Updated:** 2026-02-21 (Phase 7 Complete)
**Next Update:** After Phase 8 (Authentication UI)
