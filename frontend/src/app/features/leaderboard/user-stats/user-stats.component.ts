import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
import { Tournament } from '../../../core/models/match.model';

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-stats.component.html'
})
export class UserStatsComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  private router = inject(Router);

  tournaments = signal<Tournament[]>([]);
  selectedTournamentId = signal<string>('');

  userStats = this.leaderboardService.userStats;
  isLoading = this.leaderboardService.isLoading;
  error = this.leaderboardService.error;
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  accuracyRate = computed(() => {
    const stats = this.userStats();
    if (!stats || stats.totalPredictions === 0) return 0;
    return ((stats.exactScores + stats.correctWinners) / stats.totalPredictions) * 100;
  });

  predictionPointsPercentage = computed(() => {
    const stats = this.userStats();
    if (!stats || stats.totalPoints === 0) return 0;
    return (stats.predictionPoints / stats.totalPoints) * 100;
  });

  bonusPointsPercentage = computed(() => {
    const stats = this.userStats();
    if (!stats || stats.totalPoints === 0) return 0;
    return (stats.bonusPoints / stats.totalPoints) * 100;
  });

  maxWeeklyPoints = computed(() => {
    const stats = this.userStats();
    if (!stats || !stats.weeklyPerformance || stats.weeklyPerformance.length === 0) return 0;
    return Math.max(...stats.weeklyPerformance.map(w => w.points));
  });

  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
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
            this.loadUserStats();
          }
        }
      },
      error: (err) => console.error('Failed to load tournaments', err)
    });
  }

  loadUserStats(): void {
    const tournamentId = this.selectedTournamentId();
    if (!tournamentId) return;

    this.leaderboardService.getUserStats(tournamentId).subscribe();
  }

  onTournamentChange(): void {
    this.loadUserStats();
  }

  getWeeklyBarHeight(points: number): string {
    const max = this.maxWeeklyPoints();
    if (max === 0) return '0%';
    return `${(points / max) * 100}%`;
  }
}
