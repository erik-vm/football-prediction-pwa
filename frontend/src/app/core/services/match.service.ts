import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MatchDto } from '../../shared/models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  constructor(private api: ApiService) {}

  getById(id: string): Observable<MatchDto> {
    return this.api.get<MatchDto>(`/matches/${id}`);
  }

  getUpcoming(): Observable<MatchDto[]> {
    return this.api.get<MatchDto[]>('/matches/upcoming');
  }

  getFinished(): Observable<MatchDto[]> {
    return this.api.get<MatchDto[]>('/matches/finished');
  }

  getFiltered(competitionCode: string, matchday: number): Observable<MatchDto[]> {
    return this.api.get<MatchDto[]>('/matches/filtered', { competitionCode, matchday });
  }

  getCompetitions(): Observable<string[]> {
    return this.api.get<string[]>('/matches/competitions');
  }

  getMatchdays(competitionCode: string): Observable<number[]> {
    return this.api.get<number[]>('/matches/matchdays', { competitionCode });
  }

  getNearestMatchday(competitionCode: string, tab: string): Observable<number> {
    return this.api.get<number>('/matches/nearest-matchday', { competitionCode, tab });
  }

  syncMatches(): Observable<void> {
    return this.api.post<void>('/matches/sync', {});
  }
}
