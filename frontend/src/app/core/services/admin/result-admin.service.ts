import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';

export interface SubmitResultRequest {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface ResultSubmissionResponse {
  matchId: string;
  homeScore: number;
  awayScore: number;
  predictionsCalculated: number;
}

@Injectable({
  providedIn: 'root'
})
export class ResultAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/results`;

  submitResult(request: SubmitResultRequest): Observable<ApiResponse<ResultSubmissionResponse>> {
    return this.http.post<ApiResponse<ResultSubmissionResponse>>(this.apiUrl, request);
  }
}
