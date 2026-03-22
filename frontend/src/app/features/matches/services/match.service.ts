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

  getFiltered(competitionCode?: string, matchday?: number): Observable<Match[]> {
    const params: string[] = [];
    if (competitionCode) params.push(`competitionCode=${competitionCode}`);
    if (matchday) params.push(`matchday=${matchday}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.api.get<Match[]>(`matches/filtered${query}`);
  }

  getCompetitions(): Observable<string[]> {
    return this.api.get<string[]>('matches/competitions');
  }

  getMatchdays(competitionCode?: string): Observable<number[]> {
    const query = competitionCode ? `?competitionCode=${competitionCode}` : '';
    return this.api.get<number[]>(`matches/matchdays${query}`);
  }

  getNearestMatchday(competitionCode: string, tab: string): Observable<number | null> {
    return this.api.get<number | null>(`matches/nearest-matchday?competitionCode=${competitionCode}&tab=${tab}`);
  }
}
