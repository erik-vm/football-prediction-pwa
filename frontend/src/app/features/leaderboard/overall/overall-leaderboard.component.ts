import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tournament } from '../../../core/models/match.model';
import { LeaderboardEntry } from '../../../core/models/leaderboard.model';

@Component({
  selector: 'app-overall-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './overall-leaderboard.component.html'
})
export class OverallLeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);

  tournaments = signal<Tournament[]>([]);
  selectedTournamentId = signal<string>('');
  displayLimit = signal<number>(10);
  showLoadMore = signal<boolean>(false);

  leaderboard = this.leaderboardService.overallLeaderboard;
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
            this.loadLeaderboard();
          }
        }
      },
      error: (err) => console.error('Failed to load tournaments', err)
    });
  }

  loadLeaderboard(): void {
    const tournamentId = this.selectedTournamentId();
    if (!tournamentId) return;

    this.leaderboardService.getOverallLeaderboard(tournamentId, this.displayLimit()).subscribe({
      next: (response) => {
        if (response.data) {
          this.showLoadMore.set(response.data.length >= this.displayLimit());
        }
      }
    });
  }

  onTournamentChange(): void {
    this.displayLimit.set(10);
    this.loadLeaderboard();
  }

  loadMore(): void {
    this.displayLimit.update(limit => limit + 10);
    this.loadLeaderboard();
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return entry.userId === this.currentUser()?.id;
  }

  getAccuracyRate(entry: LeaderboardEntry): number {
    if (entry.totalPredictions === 0) return 0;
    return ((entry.exactScores + entry.correctWinners) / entry.totalPredictions) * 100;
  }
}
