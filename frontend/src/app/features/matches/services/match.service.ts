import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Match } from '../../../shared/models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private api = inject(ApiService);

  getUpcoming(): Observable<Match[]> {
    return this.api.get<Match[]>('matches/upcoming');
  }

  getFinished(): Observable<Match[]> {
    return this.api.get<Match[]>('matches/finished');
  }

  getById(id: string): Observable<Match> {
    return this.api.get<Match>(`matches/${id}`);
  }

  getByGameWeek(gameWeekId: string): Observable<Match[]> {
    return this.api.get<Match[]>(`matches?gameWeekId=${gameWeekId}`);
  }
}
