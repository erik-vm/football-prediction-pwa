import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { LeaderboardEntry } from '../../../shared/models/leaderboard.model';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private api = inject(ApiService);

  getOverall(): Observable<LeaderboardEntry[]> {
    return this.api.get<LeaderboardEntry[]>('leaderboard');
  }

  getByTournament(tournamentId: string): Observable<LeaderboardEntry[]> {
    return this.api.get<LeaderboardEntry[]>(`leaderboard/tournament/${tournamentId}`);
  }

  getByCompetition(competitionCode: string): Observable<LeaderboardEntry[]> {
    return this.api.get<LeaderboardEntry[]>(`leaderboard/competition/${competitionCode}`);
  }
}
