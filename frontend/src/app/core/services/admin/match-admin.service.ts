import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Match, TournamentStage } from '../../models/match.model';
import { ApiResponse } from '../../models/api-response.model';

export interface CreateMatchRequest {
  tournamentId: string;
  gameWeekId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  stage: TournamentStage;
}

export interface UpdateMatchRequest {
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  stage: TournamentStage;
}

@Injectable({
  providedIn: 'root'
})
export class MatchAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/matches`;

  getAllMatches(): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(this.apiUrl);
  }

  getMatchesByTournament(tournamentId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}?tournamentId=${tournamentId}`);
  }

  getMatchesByGameWeek(gameWeekId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}/gameweek/${gameWeekId}`);
  }

  getMatch(id: string): Observable<ApiResponse<Match>> {
    return this.http.get<ApiResponse<Match>>(`${this.apiUrl}/${id}`);
  }

  createMatch(request: CreateMatchRequest): Observable<ApiResponse<Match>> {
    return this.http.post<ApiResponse<Match>>(this.apiUrl, request);
  }

  updateMatch(id: string, request: UpdateMatchRequest): Observable<ApiResponse<Match>> {
    return this.http.put<ApiResponse<Match>>(`${this.apiUrl}/${id}`, request);
  }

  deleteMatch(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
