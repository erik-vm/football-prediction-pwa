import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LeaderboardEntryDto } from '../../shared/models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  constructor(private api: ApiService) {}

  getByCompetition(code: string): Observable<LeaderboardEntryDto[]> {
    return this.api.get<LeaderboardEntryDto[]>(`/leaderboard/competition/${code}`);
  }
}
