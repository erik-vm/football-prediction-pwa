import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Prediction, PredictionRequest, PredictionWithMatch } from '../models/prediction.model';
import { ApiResponse } from '../models/api-response.model';
import { IndexedDBService } from './indexeddb.service';
import { SyncQueueService } from './sync-queue.service';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private indexedDB = inject(IndexedDBService);
  private syncQueue = inject(SyncQueueService);
  private apiUrl = `${environment.apiUrl}/predictions`;

  private isLoadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private isOnlineSignal = signal<boolean>(navigator.onLine);

  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  constructor() {
    window.addEventListener('online', () => {
      this.isOnlineSignal.set(true);
      this.processPendingQueue();
    });
    window.addEventListener('offline', () => this.isOnlineSignal.set(false));
  }

  private async processPendingQueue(): Promise<void> {
    if (this.syncQueue.hasQueuedItems()) {
      console.log('Processing pending predictions queue...');
      await this.syncQueue.processQueue(async (request) => {
        return new Promise((resolve) => {
          this.submitPredictionToServer(request).subscribe({
            next: () => resolve(true),
            error: () => resolve(false)
          });
        });
      });
    }
  }

  submitPrediction(request: PredictionRequest): Observable<ApiResponse<Prediction>> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    if (!this.isOnlineSignal()) {
      const queueId = this.syncQueue.addToQueue(request);
      this.isLoadingSignal.set(false);
      return of({
        success: true,
        message: 'Prediction queued for sync when online',
        data: {
          id: queueId,
          matchId: request.matchId,
          userId: '',
          homeScore: request.homeScore,
          awayScore: request.awayScore,
          pointsEarned: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Prediction
      } as ApiResponse<Prediction>);
    }

    return this.submitPredictionToServer(request);
  }

  private submitPredictionToServer(request: PredictionRequest): Observable<ApiResponse<Prediction>> {
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

  getUserPredictions(tournamentId?: string): Observable<ApiResponse<Prediction[]>> {
    const url = `${this.apiUrl}/my`;

    if (!this.isOnlineSignal()) {
      return from(this.indexedDB.getPredictions(tournamentId)).pipe(
        switchMap(cachedPredictions => {
          return of({
            success: true,
            message: 'Loaded from cache (offline)',
            data: cachedPredictions as any
          } as ApiResponse<Prediction[]>);
        })
      );
    }

    return this.http.get<ApiResponse<Prediction[]>>(url).pipe(
      tap(response => {
        // Skip IndexedDB caching for now since predictions don't have the right structure for the DB schema
        // if (response.data) {
        //   this.indexedDB.cachePredictions(response.data as any);
        // }
      }),
      catchError(error => {
        console.error('Error fetching predictions:', error);
        return of({
          success: false,
          message: 'Failed to fetch predictions',
          data: []
        } as ApiResponse<Prediction[]>);
      })
    );
  }

  getPredictionByMatch(matchId: string): Observable<ApiResponse<Prediction>> {
    return this.http.get<ApiResponse<Prediction>>(`${this.apiUrl}/match/${matchId}`);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
