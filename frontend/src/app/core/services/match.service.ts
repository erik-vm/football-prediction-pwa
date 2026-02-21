import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Match, Tournament, GameWeek } from '../models/match.model';
import { ApiResponse } from '../models/api-response.model';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private http = inject(HttpClient);
  private indexedDB = inject(IndexedDBService);
  private apiUrl = `${environment.apiUrl}`;

  private isOnlineSignal = signal<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.isOnlineSignal.set(true));
    window.addEventListener('offline', () => this.isOnlineSignal.set(false));
  }

  getActiveTournament(): Observable<ApiResponse<Tournament>> {
    return this.http.get<ApiResponse<Tournament>>(`${this.apiUrl}/tournaments/active`);
  }

  getTournaments(): Observable<ApiResponse<Tournament[]>> {
    return this.http.get<ApiResponse<Tournament[]>>(`${this.apiUrl}/tournaments`);
  }

  getGameWeeks(tournamentId: string): Observable<ApiResponse<GameWeek[]>> {
    return this.http.get<ApiResponse<GameWeek[]>>(`${this.apiUrl}/tournaments/${tournamentId}/gameweeks`);
  }

  getUpcomingMatches(tournamentId: string): Observable<ApiResponse<Match[]>> {
    if (!this.isOnlineSignal()) {
      return from(this.indexedDB.getMatches(tournamentId)).pipe(
        switchMap(cachedMatches => {
          return of({
            success: true,
            message: 'Loaded from cache (offline)',
            data: cachedMatches
          } as ApiResponse<Match[]>);
        })
      );
    }

    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/matches/upcoming?tournamentId=${tournamentId}`).pipe(
      tap(response => {
        if (response.data) {
          this.indexedDB.cacheMatches(response.data);
        }
      }),
      catchError(error => {
        console.error('Error fetching matches, trying cache:', error);
        return from(this.indexedDB.getMatches(tournamentId)).pipe(
          switchMap(cachedMatches => {
            return of({
              success: true,
              message: 'Loaded from cache (fallback)',
              data: cachedMatches
            } as ApiResponse<Match[]>);
          })
        );
      })
    );
  }

  getMatchesByGameWeek(gameWeekId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/matches/gameweek/${gameWeekId}`);
  }

  getMatch(matchId: string): Observable<ApiResponse<Match>> {
    if (!this.isOnlineSignal()) {
      return from(this.indexedDB.getMatch(matchId)).pipe(
        switchMap(cachedMatch => {
          return of({
            success: true,
            message: 'Loaded from cache (offline)',
            data: cachedMatch
          } as ApiResponse<Match>);
        })
      );
    }

    return this.http.get<ApiResponse<Match>>(`${this.apiUrl}/matches/${matchId}`).pipe(
      tap(response => {
        if (response.data) {
          this.indexedDB.cacheMatches([response.data]);
        }
      }),
      catchError(error => {
        console.error('Error fetching match, trying cache:', error);
        return from(this.indexedDB.getMatch(matchId)).pipe(
          switchMap(cachedMatch => {
            return of({
              success: true,
              message: 'Loaded from cache (fallback)',
              data: cachedMatch
            } as ApiResponse<Match>);
          })
        );
      })
    );
  }

  getMatches(filters?: {
    competitionCode?: string;
    isFinished?: boolean;
    matchday?: number;
  }): Observable<ApiResponse<Match[]>> {
    let url = `${this.apiUrl}/matches`;
    const params: string[] = [];

    if (filters?.competitionCode) {
      params.push(`competitionCode=${filters.competitionCode}`);
    }
    if (filters?.isFinished !== undefined) {
      params.push(`isFinished=${filters.isFinished}`);
    }
    if (filters?.matchday !== undefined) {
      params.push(`matchday=${filters.matchday}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<ApiResponse<Match[]>>(url);
  }
}
