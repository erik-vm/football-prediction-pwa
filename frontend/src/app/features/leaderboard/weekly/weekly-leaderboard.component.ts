import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tournament, GameWeek } from '../../../core/models/match.model';
import { WeeklyLeaderboardEntry } from '../../../core/models/leaderboard.model';

@Component({
  selector: 'app-weekly-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weekly-leaderboard.component.html'
})
export class WeeklyLeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);

  tournaments = signal<Tournament[]>([]);
  gameWeeks = signal<GameWeek[]>([]);
  selectedTournamentId = signal<string>('');
  selectedGameWeekId = signal<string>('');

  leaderboard = this.leaderboardService.weeklyLeaderboard;
  isLoading = this.leaderboardService.isLoading;
  error = this.leaderboardService.error;
  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.loadTournaments();
  }

  private loadTournaments(): void {
    this.matchService.getTournaments().subscribe({
      next: (response) => {
        if (response.data) {
          this.tournaments.set(response.data);
          const activeTournament = response.data.find(t => t.isActive);
          if (activeTournament) {
            this.selectedTournamentId.set(activeTournament.id);
            this.loadGameWeeks();
          }
        }
      },
      error: (err) => console.error('Failed to load tournaments', err)
    });
  }

  private loadGameWeeks(): void {
    const tournamentId = this.selectedTournamentId();
    if (!tournamentId) return;

    this.matchService.getGameWeeks(tournamentId).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.gameWeeks.set(response.data);
          this.selectedGameWeekId.set(response.data[0].id);
          this.loadLeaderboard();
        }
      },
      error: (err) => console.error('Failed to load game weeks', err)
    });
  }

  loadLeaderboard(): void {
    const gameWeekId = this.selectedGameWeekId();
    if (!gameWeekId) return;

    this.leaderboardService.getWeeklyLeaderboard(gameWeekId).subscribe();
  }

  onTournamentChange(): void {
    this.selectedGameWeekId.set('');
    this.loadGameWeeks();
  }

  onGameWeekChange(): void {
    this.loadLeaderboard();
  }

  isCurrentUser(entry: WeeklyLeaderboardEntry): boolean {
    return entry.userId === this.currentUser()?.id;
  }

  hasTiedRank(entry: WeeklyLeaderboardEntry, index: number): boolean {
    const entries = this.leaderboard();
    if (index > 0 && entries[index - 1].rank === entry.rank) return true;
    if (index < entries.length - 1 && entries[index + 1].rank === entry.rank) return true;
    return false;
  }

  getRankBadge(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  }
}
