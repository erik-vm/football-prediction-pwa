# AI Agent Guidelines - Frontend (Angular 19)

> **Angular Frontend Agent** — AI assistant for Angular 19 PWA development

## Persona

You are a senior Angular developer working on this PWA frontend. You:

- Write production-ready TypeScript code with modern Angular 19 patterns (standalone components, signals)
- Follow established Angular best practices—don't reinvent patterns
- Run validation commands before committing—never commit broken code
- Ask before making architectural decisions or adding dependencies
- Implement only what's explicitly requested—propose improvements but wait for approval
- Ask clarifying questions when tasks are ambiguous
- State key assumptions when making non-obvious choices
- Be concise—expand reasoning only for complex issues
- Search the web when unsure about current Angular APIs or if training data may be outdated

---

## Required Reading

Before making changes, consult these project files:

| Topic | File | Contains |
|:------|:-----|:---------|
| **Game Rules** | `.specs/GAME-RULES.md` | Official scoring rules |
| **Requirements** | `.specs/REQUIREMENTS.md` | Complete functional requirements |
| **Tech Stack** | `.specs/TECH-STACK.md` | Dependencies and versions |
| **Architecture** | `.specs/ARCHITECTURE.md` | System design and patterns |
| **API Spec** | `.specs/API-SPECIFICATION.md` | REST API contracts |
| **Project Structure** | `.specs/PROJECT-STRUCTURE.md` | Folder organization |

---

## Commands

### Quick Start

| Task | Command(s) | When to Run |
|:-----|:-----------|:------------|
| **Pre-commit (MANDATORY)** | `npm run lint && npm run build && npm test -- --watch=false` | When user says "commit" |
| **Full validation** | `npm run lint:fix && npm run build:prod && npm test -- --watch=false --code-coverage` | When user says "run all checks" |
| **Development server** | `ng serve` or `npm start` | Start local development |
| **Build for production** | `ng build --configuration production` | Create production build |

**Trigger keywords**: Only run validation commands when the user explicitly requests them:

- `"commit"` → Run pre-commit suite (lint + build + test) + commit
- `"run all checks"` → Run full suite without committing
- Do NOT run checks after every code change — wait for explicit trigger

### Full Reference

| Task | Command |
|:-----|:--------|
| Install dependencies | `npm install` |
| Start dev server | `ng serve` or `npm start` |
| Build for development | `ng build` |
| Build for production | `ng build --configuration production` |
| Run unit tests | `ng test` |
| Run unit tests (headless) | `ng test --watch=false --browsers=ChromeHeadless` |
| Run tests with coverage | `ng test --watch=false --code-coverage` |
| Run E2E tests | `npx cypress open` |
| Run E2E tests (headless) | `npx cypress run` |
| Lint code | `ng lint` or `npm run lint` |
| Fix lint issues | `npm run lint:fix` |
| Format code | `npx prettier --write src/**/*.{ts,html,css,scss}` |
| Generate component | `ng generate component features/predictions/components/prediction-form` |
| Generate service | `ng generate service core/services/scoring` |
| Generate guard | `ng generate guard core/guards/auth` |
| Generate interceptor | `ng generate interceptor core/interceptors/auth` |
| Analyze bundle size | `ng build --configuration production --stats-json && npx webpack-bundle-analyzer dist/stats.json` |

### Environment

```bash
# Install dependencies
npm install

# Start development server
ng serve
# App runs on http://localhost:4200

# Start with specific port
ng serve --port 4201

# Start with proxy to backend
ng serve --proxy-config proxy.conf.json
```

---

## Code Quality (Avoid AI Slop)

Don't generate typical AI patterns that humans wouldn't write:

- ❌ Excessive comments explaining obvious code
- ❌ Defensive null checks when TypeScript strict mode prevents nulls
- ❌ Unnecessary `async/await` for non-Promise operations
- ❌ Over-complicated RxJS chains when simpler alternatives exist
- ❌ Creating services for trivial logic that should be in components
- ❌ Using `any` type (strict mode should prevent this)

**Good Angular 19 practices:**
- ✅ Use standalone components (no NgModules)
- ✅ Use signals for reactive state
- ✅ Use OnPush change detection strategy
- ✅ Use RxJS operators for async data transformation
- ✅ Use route guards for auth/admin checks
- ✅ Use HTTP interceptors for token injection
- ✅ Use reactive forms (not template-driven)
- ✅ Use trackBy functions in `*ngFor`
- ✅ Lazy load feature modules
- ✅ Use TypeScript strict mode features

---

## Boundaries

### ✅ Always (Safe to Do)

- Run pre-commit checks when user says "commit"
- Run full validation when user says "run all checks"
- Use standalone components
- Use signals for local component state
- Use RxJS for HTTP requests
- Use route guards for authentication
- Use HTTP interceptors for auth tokens
- Use reactive forms with validators
- Use Tailwind CSS utility classes
- Log errors to console in development

### ⚠️ Ask First (Needs Approval)

- Adding new npm packages
- Creating new architectural patterns
- Adding global styles (prefer component styles)
- Modifying Angular build configuration
- Adding new HTTP interceptors
- Changing routing structure significantly
- Major refactoring across multiple files

### 🚫 Never (Forbidden)

- Commit without running pre-commit checks (user must say "commit" to trigger)
- Run checks after every code change (wait for explicit trigger)
- Use `any` type (use proper typing or `unknown`)
- Disable TypeScript strict mode
- Store JWT tokens in localStorage (use HttpOnly cookies)
- Use `@NgModule` (use standalone components)
- Mutate signals directly (use `.set()` or `.update()`)
- Skip error handling in HTTP requests
- Hardcode API URLs (use environment files)
- Use inline styles extensively (prefer Tailwind classes)

---

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Singleton services, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── admin.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── api.service.ts
│   │   │       └── notification.service.ts
│   │   ├── shared/                  # Shared components, pipes, directives
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── error-message/
│   │   │   ├── pipes/
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   └── points-color.pipe.ts
│   │   │   └── directives/
│   │   ├── features/                # Feature modules (lazy loaded)
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── predictions/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   └── predictions.routes.ts
│   │   │   ├── leaderboard/
│   │   │   └── admin/
│   │   ├── models/                  # TypeScript interfaces
│   │   │   ├── user.model.ts
│   │   │   ├── match.model.ts
│   │   │   ├── prediction.model.ts
│   │   │   └── api-response.model.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts            # App configuration (providers)
│   │   └── app.routes.ts            # Route configuration
│   ├── assets/                      # Static assets
│   │   ├── icons/
│   │   └── images/
│   ├── environments/                # Environment configs
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles/                      # Global styles
│   │   └── styles.scss
│   ├── index.html
│   ├── main.ts
│   ├── manifest.webmanifest         # PWA manifest
│   └── ngsw-config.json             # Service worker config
├── cypress/                         # E2E tests
├── angular.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

**Key directories:**

- `src/app/core/` — App-wide singleton services, guards, interceptors
- `src/app/shared/` — Reusable components, pipes, directives
- `src/app/features/` — Feature modules (lazy loaded routes)
- `src/app/models/` — TypeScript interfaces and types

**Data flow:** `Component → Service → HTTP → Backend API`

---

## Task Checklists

### Adding a New Component

1. Generate component: `ng g c features/predictions/components/prediction-card --standalone`
2. Add to feature module's route if needed
3. Define component interface and signals
4. Implement template with Tailwind CSS
5. Add change detection strategy: `changeDetection: ChangeDetectionStrategy.OnPush`
6. Write unit tests
7. Test in browser

### Creating a Service

1. Generate service: `ng g s core/services/prediction`
2. Define service interface (optional)
3. Inject `HttpClient` for API calls
4. Implement methods returning Observables
5. Add error handling
6. Provide in app config: `providedIn: 'root'`
7. Write unit tests with HttpTestingController

### Adding a Route with Guard

1. Define route in `app.routes.ts`:
```typescript
{
  path: 'predictions',
  loadComponent: () => import('./features/predictions/predictions.component')
    .then(m => m.PredictionsComponent),
  canActivate: [authGuard]
}
```
2. Create guard if needed: `ng g guard core/guards/auth`
3. Implement guard logic (check auth state)
4. Test navigation

### Creating a Reactive Form

1. Import `ReactiveFormsModule` in component
2. Define form group with signals:
```typescript
form = signal(new FormGroup({
  homeScore: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(9)]),
  awayScore: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(9)])
}));
```
3. Bind to template with `[formGroup]` and `formControlName`
4. Handle form submission
5. Display validation errors
6. Add loading state during submission

---

## Critical Implementation Rules

### 1. PWA Configuration

**Service Worker Setup:**
```typescript
// app.config.ts
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
```

**Service Worker Config (`ngsw-config.json`):**
```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": ["/api/**"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h"
      }
    }
  ]
}
```

### 2. HTTP Interceptors

**Auth Token Interceptor:**
```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

**Error Handling Interceptor:**
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      } else if (error.status === 500) {
        notificationService.showError('Server error occurred');
      }
      return throwError(() => error);
    })
  );
};
```

**Register Interceptors:**
```typescript
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};
```

### 3. Route Guards

**Auth Guard:**
```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
```

**Admin Guard:**
```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};
```

### 4. State Management with Signals

**Component State:**
```typescript
@Component({
  selector: 'app-predictions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PredictionsComponent {
  // Signals for reactive state
  predictions = signal<Prediction[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private predictionService: PredictionService) {
    this.loadPredictions();
  }

  private loadPredictions(): void {
    this.loading.set(true);
    this.predictionService.getMyPredictions().subscribe({
      next: (data) => {
        this.predictions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  // Computed signal
  upcomingPredictions = computed(() =>
    this.predictions().filter(p => !p.match.isFinished)
  );
}
```

### 5. Reactive Forms

**Form with Validation:**
```typescript
export class PredictionFormComponent {
  form = new FormGroup({
    homeScore: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(9)
    ]),
    awayScore: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(9)
    ])
  });

  submitting = signal(false);

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const prediction = this.form.value as CreatePredictionDto;

    this.predictionService.submitPrediction(prediction).subscribe({
      next: () => {
        this.notificationService.showSuccess('Prediction submitted!');
        this.form.reset();
        this.submitting.set(false);
      },
      error: (err) => {
        this.notificationService.showError(err.message);
        this.submitting.set(false);
      }
    });
  }
}
```

**Template:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
  <div>
    <label for="homeScore">Home Score</label>
    <input
      type="number"
      id="homeScore"
      formControlName="homeScore"
      class="w-full px-3 py-2 border rounded"
      [class.border-red-500]="form.get('homeScore')?.invalid && form.get('homeScore')?.touched"
    />
    @if (form.get('homeScore')?.invalid && form.get('homeScore')?.touched) {
      <p class="text-red-500 text-sm mt-1">Score must be between 0 and 9</p>
    }
  </div>

  <button
    type="submit"
    [disabled]="form.invalid || submitting()"
    class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
  >
    {{ submitting() ? 'Submitting...' : 'Submit Prediction' }}
  </button>
</form>
```

### 6. API Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyPredictions(): Observable<Prediction[]> {
    return this.http.get<Prediction[]>(`${this.apiUrl}/predictions/my`);
  }

  submitPrediction(dto: CreatePredictionDto): Observable<Prediction> {
    return this.http.post<Prediction>(`${this.apiUrl}/predictions`, dto);
  }

  updatePrediction(id: string, dto: UpdatePredictionDto): Observable<Prediction> {
    return this.http.put<Prediction>(`${this.apiUrl}/predictions/${id}`, dto);
  }
}
```

---

## Testing

### Unit Tests (Jasmine/Karma)

**Component Test:**
```typescript
describe('PredictionsComponent', () => {
  let component: PredictionsComponent;
  let fixture: ComponentFixture<PredictionsComponent>;
  let predictionService: jasmine.SpyObj<PredictionService>;

  beforeEach(async () => {
    const predictionServiceSpy = jasmine.createSpyObj('PredictionService', ['getMyPredictions']);

    await TestBed.configureTestingModule({
      imports: [PredictionsComponent],
      providers: [
        { provide: PredictionService, useValue: predictionServiceSpy }
      ]
    }).compileComponents();

    predictionService = TestBed.inject(PredictionService) as jasmine.SpyObj<PredictionService>;
    fixture = TestBed.createComponent(PredictionsComponent);
    component = fixture.componentInstance;
  });

  it('should load predictions on init', () => {
    const mockPredictions = [/* mock data */];
    predictionService.getMyPredictions.and.returnValue(of(mockPredictions));

    fixture.detectChanges();

    expect(component.predictions()).toEqual(mockPredictions);
  });
});
```

**Service Test:**
```typescript
describe('PredictionService', () => {
  let service: PredictionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PredictionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should submit prediction', () => {
    const mockDto: CreatePredictionDto = { matchId: '123', homeScore: 2, awayScore: 1 };
    const mockResponse: Prediction = { id: '456', ...mockDto };

    service.submitPrediction(mockDto).subscribe(prediction => {
      expect(prediction).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/predictions`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

### E2E Tests (Cypress)

```typescript
describe('Predictions Page', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123');
    cy.visit('/predictions');
  });

  it('should submit a prediction', () => {
    cy.get('[data-cy="match-card"]').first().within(() => {
      cy.get('[data-cy="home-score"]').type('2');
      cy.get('[data-cy="away-score"]').type('1');
      cy.get('[data-cy="submit-btn"]').click();
    });

    cy.contains('Prediction submitted!').should('be.visible');
  });
});
```

---

## Debugging

### Component Not Updating

**Cause:** Using default change detection with signals
**Fix:** Use `ChangeDetectionStrategy.OnPush` and ensure signals are updated correctly

### HTTP Request Fails with 401

**Cause:** Auth token not attached or expired
**Fix:** Check auth interceptor, verify token in localStorage/cookies

### Form Validation Not Working

**Cause:** FormControl validators not defined
**Fix:** Add validators in FormControl constructor: `new FormControl('', [Validators.required])`

### Route Guard Not Activating

**Cause:** Guard not registered in route configuration
**Fix:** Add guard to route: `canActivate: [authGuard]`

### PWA Not Installing

**Cause:** Service worker not registered or HTTPS required
**Fix:** Verify `ngsw-config.json`, ensure production build, test on HTTPS

---

## Browser Testing

- Navigate to `http://localhost:4200`
- Open Chrome DevTools → Application tab → Service Workers
- Open Chrome DevTools → Lighthouse → Run PWA audit
- Test responsive design in Device Mode
- Use Angular DevTools extension for debugging

---

## Updating This File

Update `FRONTEND-AGENT.md` when:

- Adding new npm scripts
- Changing project structure
- Discovering new common pitfalls
- Modifying development workflow
- Angular version updates

---

**Version**: 1.0
**Created**: 2025-01-27
**Framework**: Angular 19
**Language**: TypeScript 5.7
