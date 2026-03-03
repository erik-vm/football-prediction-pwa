import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { CompetitionPreferenceService } from '../../../core/services/competition-preference.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaderboardEntry } from '../../../core/models/leaderboard.model';
import { UserStatsCardComponent, UserStatsCardData } from '../../../shared/components/user-stats-card/user-stats-card.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CompetitionSelectorComponent } from '../../../shared/components/competition-selector/competition-selector.component';

@Component({
  selector: 'app-overall-leaderboard',
  standalone: true,
  imports: [CommonModule, FormsModule, UserStatsCardComponent, HeaderComponent, CompetitionSelectorComponent],
  templateUrl: './overall-leaderboard.component.html'
})
export class OverallLeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private competitionService = inject(CompetitionService);
  private preferenceService = inject(CompetitionPreferenceService);
  private authService = inject(AuthService);

  selectedCompetitionSignal = signal<string>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('selectedCompetitionLeaderboard') || 'PL' : 'PL'
  );
  displayLimit = signal<number>(10);
  showLoadMore = signal<boolean>(false);
  leaderboardDataSignal = signal<any[]>([]);

  // Filter active competitions by user preferences
  activeCompetitions = computed(() => {
    const allActive = this.competitionService.activeCompetitions();
    const preferences = this.preferenceService.preferences();

    // If user has preferences, only show preferred competitions
    if (preferences.length > 0) {
      const preferredCodes = new Set(preferences.map(p => p.competitionCode));
      return allActive.filter(c => preferredCodes.has(c.code));
    }

    // Otherwise show all active competitions
    return allActive;
  });

  isLoading = this.leaderboardService.isLoading;
  error = this.leaderboardService.error;
  currentUser = this.authService.currentUser;
  selectedCompetition = this.selectedCompetitionSignal.asReadonly();

  userStatsData = computed<UserStatsCardData | null>(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return null;

    const userEntry = this.leaderboardDataSignal().find((entry: any) => entry.userId === userId);
    if (!userEntry) return null;

    return {
      rank: userEntry.rank,
      points: userEntry.totalPoints,
      predictions: userEntry.totalPredictions,
      accuracy: userEntry.accuracy
    };
  });

  ngOnInit(): void {
    this.competitionService.getCompetitions(true).subscribe();
    this.preferenceService.getUserPreferences().subscribe();
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    const competitionCode = this.selectedCompetitionSignal();
    if (!competitionCode) return;

    this.leaderboardService.getCompetitionLeaderboard(competitionCode, this.displayLimit()).subscribe({
      next: (data) => {
        this.leaderboardDataSignal.set(data);
        this.showLoadMore.set(data.length >= this.displayLimit());
      },
      error: (err) => console.error('Failed to load leaderboard', err)
    });
  }

  onCompetitionChange(competitionCode: string): void {
    this.selectedCompetitionSignal.set(competitionCode);
    this.displayLimit.set(10);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedCompetitionLeaderboard', competitionCode);
    }
    this.loadLeaderboard();
  }

  loadMore(): void {
    this.displayLimit.update(limit => limit + 10);
    this.loadLeaderboard();
  }

  isCurrentUser(entry: any): boolean {
    return entry.userId === this.currentUser()?.id;
  }

  getAccuracyRate(entry: any): number {
    return entry.accuracy || 0;
  }
}
