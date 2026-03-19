import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { OfflineService } from '../../../core/services/offline.service';
import { OfflineQueueService } from '../../../core/services/offline-queue.service';
import { Prediction, PredictionRequest } from '../../../shared/models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private api = inject(ApiService);
  private offlineService = inject(OfflineService);
  private offlineQueue = inject(OfflineQueueService);

  getMyPredictions(): Observable<Prediction[]> {
    return this.api.get<Prediction[]>('predictions/my');
  }

  getByMatchId(matchId: string): Observable<Prediction> {
    return this.api.get<Prediction>(`predictions/match/${matchId}`);
  }

  create(request: PredictionRequest): Observable<Prediction> {
    if (!this.offlineService.isOnline()) {
      this.offlineQueue.queuePrediction(request);
      return throwError(() => new Error('Offline - prediction queued for sync'));
    }

    return this.api.post<Prediction>('predictions', request).pipe(
      catchError(error => {
        if (!navigator.onLine) {
          this.offlineQueue.queuePrediction(request);
          return throwError(() => new Error('Network error - prediction queued for sync'));
        }
        return throwError(() => error);
      })
    );
  }

  update(id: string, request: PredictionRequest): Observable<Prediction> {
    if (!this.offlineService.isOnline()) {
      return throwError(() => new Error('Cannot update predictions while offline'));
    }

    return this.api.put<Prediction>(`predictions/${id}`, request);
  }

  delete(id: string): Observable<void> {
    if (!this.offlineService.isOnline()) {
      return throwError(() => new Error('Cannot delete predictions while offline'));
    }

    return this.api.delete<void>(`predictions/${id}`);
  }
}
