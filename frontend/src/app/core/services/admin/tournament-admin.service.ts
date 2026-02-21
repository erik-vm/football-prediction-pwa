import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Tournament } from '../../models/match.model';
import { ApiResponse } from '../../models/api-response.model';

export interface CreateTournamentRequest {
  name: string;
  year: number;
  isActive: boolean;
}

export interface UpdateTournamentRequest {
  name: string;
  year: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TournamentAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tournaments`;

  getAllTournaments(): Observable<ApiResponse<Tournament[]>> {
    return this.http.get<ApiResponse<Tournament[]>>(this.apiUrl);
  }

  getTournament(id: string): Observable<ApiResponse<Tournament>> {
    return this.http.get<ApiResponse<Tournament>>(`${this.apiUrl}/${id}`);
  }

  createTournament(request: CreateTournamentRequest): Observable<ApiResponse<Tournament>> {
    return this.http.post<ApiResponse<Tournament>>(this.apiUrl, request);
  }

  updateTournament(id: string, request: UpdateTournamentRequest): Observable<ApiResponse<Tournament>> {
    return this.http.put<ApiResponse<Tournament>>(`${this.apiUrl}/${id}`, request);
  }

  deleteTournament(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  activateTournament(id: string): Observable<ApiResponse<Tournament>> {
    return this.http.patch<ApiResponse<Tournament>>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateTournament(id: string): Observable<ApiResponse<Tournament>> {
    return this.http.patch<ApiResponse<Tournament>>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
