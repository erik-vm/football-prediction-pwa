import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserCompetitionPreference {
  id: string;
  userId: string;
  competitionCode: string;
  createdAt: string;
  competition?: {
    code: string;
    name: string;
    emblem?: string;
    isActive: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionPreferenceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users/me/preferences`;

  preferences = signal<UserCompetitionPreference[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  getUserPreferences(): Observable<UserCompetitionPreference[]> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<UserCompetitionPreference[]>(this.apiUrl).pipe(
      tap(preferences => {
        this.preferences.set(preferences);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set(error.error?.message || 'Failed to load preferences');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  addPreference(competitionCode: string): Observable<UserCompetitionPreference> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<UserCompetitionPreference>(`${this.apiUrl}/competitions/${competitionCode}`, {}).pipe(
      tap(preference => {
        this.preferences.update(prefs => [...prefs, preference]);
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set(error.error?.message || 'Failed to add preference');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  removePreference(competitionCode: string): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/competitions/${competitionCode}`).pipe(
      tap(() => {
        this.preferences.update(prefs => prefs.filter(p => p.competitionCode !== competitionCode));
        this.isLoading.set(false);
      }),
      catchError(error => {
        this.error.set(error.error?.message || 'Failed to remove preference');
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  togglePreference(competitionCode: string): Observable<UserCompetitionPreference | void> {
    const hasPreference = this.preferences().some(p => p.competitionCode === competitionCode);
    return hasPreference ? this.removePreference(competitionCode) : this.addPreference(competitionCode);
  }

  hasPreference(competitionCode: string): boolean {
    return this.preferences().some(p => p.competitionCode === competitionCode);
  }

  clearError(): void {
    this.error.set(null);
  }
}
