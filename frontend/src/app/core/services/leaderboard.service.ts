import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeaderboardEntry, WeeklyLeaderboardEntry, UserStats } from '../models/leaderboard.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/leaderboard`;

  // Signals for state management
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private overallLeaderboardSignal = signal<LeaderboardEntry[]>([]);
  private weeklyLeaderboardSignal = signal<WeeklyLeaderboardEntry[]>([]);
  private userStatsSignal = signal<UserStats | null>(null);

  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  overallLeaderboard = this.overallLeaderboardSignal.asReadonly();
  weeklyLeaderboard = this.weeklyLeaderboardSignal.asReadonly();
  userStats = this.userStatsSignal.asReadonly();

  getOverallLeaderboard(tournamentId: string, limit?: number): Observable<ApiResponse<LeaderboardEntry[]>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const url = limit
      ? `${this.apiUrl}/overall/${tournamentId}?limit=${limit}`
      : `${this.apiUrl}/overall/${tournamentId}`;

    return this.http.get<ApiResponse<LeaderboardEntry[]>>(url).pipe(
      tap(response => {
        if (response.data) {
          this.overallLeaderboardSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to load overall leaderboard');
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getWeeklyLeaderboard(gameWeekId: string): Observable<ApiResponse<WeeklyLeaderboardEntry[]>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<ApiResponse<WeeklyLeaderboardEntry[]>>(`${this.apiUrl}/weekly/${gameWeekId}`).pipe(
      tap(response => {
        if (response.data) {
          this.weeklyLeaderboardSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to load weekly leaderboard');
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getUserStats(tournamentId: string): Observable<ApiResponse<UserStats>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/user-stats/${tournamentId}`).pipe(
      tap(response => {
        if (response.data) {
          this.userStatsSignal.set(response.data);
        }
        this.isLoadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to load user stats');
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
