import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PredictionDto, PredictionRequest } from '../../shared/models/prediction.model';

@Injectable({ providedIn: 'root' })
export class PredictionService {
  constructor(private api: ApiService) {}

  getMyPredictions(): Observable<PredictionDto[]> {
    return this.api.get<PredictionDto[]>('/predictions/my');
  }

  getByMatch(matchId: number): Observable<PredictionDto> {
    return this.api.get<PredictionDto>(`/predictions/match/${matchId}`);
  }

  create(request: PredictionRequest): Observable<PredictionDto> {
    return this.api.post<PredictionDto>('/predictions', request);
  }

  update(id: number, request: PredictionRequest): Observable<PredictionDto> {
    return this.api.put<PredictionDto>(`/predictions/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/predictions/${id}`);
  }
}
