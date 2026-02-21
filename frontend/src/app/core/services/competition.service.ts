import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Competition } from '../models/competition.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/competitions`;

  competitions = signal<Competition[]>([]);
  activeCompetitions = signal<Competition[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  getCompetitions(activeOnly: boolean = false): Observable<ApiResponse<Competition[]>> {
    this.isLoading.set(true);
    this.error.set(null);

    const url = activeOnly ? `${this.apiUrl}?activeOnly=true` : this.apiUrl;

    return this.http.get<ApiResponse<Competition[]>>(url).pipe(
      tap({
        next: (response) => {
          if (response.data) {
            if (activeOnly) {
              this.activeCompetitions.set(response.data);
            } else {
              this.competitions.set(response.data);
            }
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.error.set(error.message || 'Failed to load competitions');
          this.isLoading.set(false);
        }
      })
    );
  }

  getCompetition(code: string): Observable<ApiResponse<Competition>> {
    return this.http.get<ApiResponse<Competition>>(`${this.apiUrl}/${code}`);
  }

  clearError(): void {
    this.error.set(null);
  }
}
