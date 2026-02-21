import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { Match, Tournament, GameWeek } from '../../../core/models/match.model';
import { PredictionWithMatch } from '../../../core/models/prediction.model';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchStatusTabsComponent, MatchStatus, MatchStatusTab } from '../../../shared/components/match-status-tabs/match-status-tabs.component';
import { MatchdayFilterComponent } from '../../../shared/components/matchday-filter/matchday-filter.component';

interface MatchWithPrediction extends Match {
  prediction?: PredictionWithMatch['prediction'];
}

interface GroupedMatches {
  gameWeek: GameWeek;
  matches: MatchWithPrediction[];
}

@Component({
  selector: 'app-predictions-list',
  standalone: true,
  imports: [CommonModule, MatchCardComponent, MatchStatusTabsComponent, MatchdayFilterComponent],
  templateUrl: './predictions-list.component.html',
  styles: []
})
export class PredictionsListComponent implements OnInit {
  private matchService = inject(MatchService);
  private predictionService = inject(PredictionService);

  private activeTournamentSignal = signal<Tournament | null>(null);
  private gameWeeksSignal = signal<GameWeek[]>([]);
  private matchesSignal = signal<MatchWithPrediction[]>([]);
  private predictionsSignal = signal<PredictionWithMatch[]>([]);
  private isLoadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);
  private activeStatusTabSignal = signal<MatchStatus>('upcoming');
  private selectedMatchdaySignal = signal<number | null>(null);

  activeTournament = this.activeTournamentSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  activeStatusTab = this.activeStatusTabSignal.asReadonly();
  selectedMatchday = this.selectedMatchdaySignal.asReadonly();

  totalMatches = computed(() => this.matchesSignal().length);
  userPredictionsCount = computed(() => this.predictionsSignal().length);

  availableMatchdays = computed(() => {
    const matches = this.matchesSignal();
    const matchdays = new Set<number>();
    matches.forEach(m => {
      if (m.matchday !== undefined && m.matchday !== null) {
        matchdays.add(m.matchday);
      }
    });
    return Array.from(matchdays).sort((a, b) => a - b);
  });

  statusTabs = computed(() => {
    const matches = this.matchesSignal();
    const now = new Date();

    const upcoming = matches.filter(m => !m.isFinished && new Date(m.kickoffTime) > now).length;
    const live = matches.filter(m => !m.isFinished && new Date(m.kickoffTime) <= now).length;
    const completed = matches.filter(m => m.isFinished).length;

    return [
      { status: 'upcoming' as MatchStatus, label: 'Upcoming', count: upcoming },
      { status: 'live' as MatchStatus, label: 'Live', count: live },
      { status: 'completed' as MatchStatus, label: 'Completed', count: completed }
    ];
  });

  filteredMatches = computed(() => {
    const statusTab = this.activeStatusTabSignal();
    const matchday = this.selectedMatchdaySignal();
    const matches = this.matchesSignal();
    const now = new Date();

    let filtered = matches;

    if (statusTab === 'upcoming') {
      filtered = filtered.filter(m => !m.isFinished && new Date(m.kickoffTime) > now);
    } else if (statusTab === 'live') {
      filtered = filtered.filter(m => !m.isFinished && new Date(m.kickoffTime) <= now);
    } else if (statusTab === 'completed') {
      filtered = filtered.filter(m => m.isFinished);
    }

    if (matchday !== null) {
      filtered = filtered.filter(m => m.matchday === matchday);
    }

    return filtered;
  });

  filteredGroupedMatches = computed(() => {
    const matches = this.filteredMatches();
    const gameWeeks = this.gameWeeksSignal();

    const grouped: GroupedMatches[] = [];

    gameWeeks.forEach(gameWeek => {
      const gameWeekMatches = matches.filter(m => m.gameWeekId === gameWeek.id);
      if (gameWeekMatches.length > 0) {
        grouped.push({
          gameWeek,
          matches: gameWeekMatches.sort((a, b) =>
            new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
          )
        });
      }
    });

    return grouped.sort((a, b) => a.gameWeek.weekNumber - b.gameWeek.weekNumber);
  });

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.matchService.getActiveTournament().subscribe({
      next: (response) => {
        if (response.data) {
          this.activeTournamentSignal.set(response.data);
          this.loadGameWeeks(response.data.id);
          this.loadMatches(response.data.id);
          this.loadPredictions(response.data.id);
        } else {
          this.errorSignal.set('No active tournament found');
          this.isLoadingSignal.set(false);
        }
      },
      error: (error) => {
        this.errorSignal.set(error.error?.message || 'Failed to load tournament');
        this.isLoadingSignal.set(false);
      }
    });
  }

  private loadGameWeeks(tournamentId: string): void {
    this.matchService.getGameWeeks(tournamentId).subscribe({
      next: (response) => {
        if (response.data) {
          this.gameWeeksSignal.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load game weeks:', error);
      }
    });
  }

  private loadMatches(tournamentId: string): void {
    this.matchService.getUpcomingMatches(tournamentId).subscribe({
      next: (response) => {
        if (response.data) {
          this.matchesSignal.set(response.data);
          this.checkLoadingComplete();
        }
      },
      error: (error) => {
        this.errorSignal.set(error.error?.message || 'Failed to load matches');
        this.isLoadingSignal.set(false);
      }
    });
  }

  private loadPredictions(tournamentId: string): void {
    this.predictionService.getUserPredictions(tournamentId).subscribe({
      next: (response) => {
        if (response.data) {
          this.predictionsSignal.set(response.data);
          this.mergePredictionsWithMatches();
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Failed to load predictions:', error);
        this.checkLoadingComplete();
      }
    });
  }

  private mergePredictionsWithMatches(): void {
    const matches = this.matchesSignal();
    const predictions = this.predictionsSignal();

    const predictionMap = new Map(
      predictions.map(p => [p.match.id, p.prediction])
    );

    const matchesWithPredictions: MatchWithPrediction[] = matches.map(match => ({
      ...match,
      prediction: predictionMap.get(match.id)
    }));

    this.matchesSignal.set(matchesWithPredictions);
  }

  private checkLoadingComplete(): void {
    if (this.matchesSignal().length > 0) {
      this.isLoadingSignal.set(false);
    }
  }

  onStatusTabChange(status: MatchStatus): void {
    this.activeStatusTabSignal.set(status);
  }

  onMatchdayChange(matchday: number | null): void {
    this.selectedMatchdaySignal.set(matchday);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
