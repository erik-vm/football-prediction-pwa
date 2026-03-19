import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Prediction, PredictionRequest } from '../../../shared/models/prediction.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private api = inject(ApiService);

  getMyPredictions(): Observable<Prediction[]> {
    return this.api.get<Prediction[]>('predictions/my');
  }

  getByMatchId(matchId: string): Observable<Prediction> {
    return this.api.get<Prediction>(`predictions/match/${matchId}`);
  }

  create(request: PredictionRequest): Observable<Prediction> {
    return this.api.post<Prediction>('predictions', request);
  }

  update(id: string, request: PredictionRequest): Observable<Prediction> {
    return this.api.put<Prediction>(`predictions/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`predictions/${id}`);
  }
}
