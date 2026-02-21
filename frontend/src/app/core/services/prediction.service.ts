import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prediction, PredictionRequest, PredictionWithMatch } from '../models/prediction.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/predictions`;

  // Signals for state management
  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  submitPrediction(request: PredictionRequest): Observable<ApiResponse<Prediction>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<ApiResponse<Prediction>>(this.apiUrl, request).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to submit prediction');
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  updatePrediction(predictionId: string, request: PredictionRequest): Observable<ApiResponse<Prediction>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.put<ApiResponse<Prediction>>(`${this.apiUrl}/${predictionId}`, request).pipe(
      tap(() => this.isLoadingSignal.set(false)),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to update prediction');
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getUserPredictions(tournamentId?: string): Observable<ApiResponse<PredictionWithMatch[]>> {
    const url = tournamentId
      ? `${this.apiUrl}/user?tournamentId=${tournamentId}`
      : `${this.apiUrl}/user`;

    return this.http.get<ApiResponse<PredictionWithMatch[]>>(url);
  }

  getPredictionByMatch(matchId: string): Observable<ApiResponse<Prediction>> {
    return this.http.get<ApiResponse<Prediction>>(`${this.apiUrl}/match/${matchId}`);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
