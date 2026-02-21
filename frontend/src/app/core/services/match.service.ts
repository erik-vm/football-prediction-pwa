import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Match, Tournament, GameWeek } from '../models/match.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;

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
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/matches/upcoming?tournamentId=${tournamentId}`);
  }

  getMatchesByGameWeek(gameWeekId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/matches/gameweek/${gameWeekId}`);
  }

  getMatch(matchId: string): Observable<ApiResponse<Match>> {
    return this.http.get<ApiResponse<Match>>(`${this.apiUrl}/matches/${matchId}`);
  }
}
