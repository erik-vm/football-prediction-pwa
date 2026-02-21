import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { Match, Tournament, GameWeek } from '../../../core/models/match.model';
import { PredictionWithMatch } from '../../../core/models/prediction.model';
import { MatchCardComponent } from '../match-card/match-card.component';

type FilterType = 'all' | 'upcoming' | 'finished';

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
  imports: [CommonModule, MatchCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Match Predictions</h1>
        <p class="text-gray-600">Submit your predictions before matches start to earn points</p>
      </div>

      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600">Loading matches...</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ error() }}</p>
        </div>
      } @else {
        @if (activeTournament()) {
          <div class="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">
                  {{ activeTournament()!.name }} {{ activeTournament()!.year }}
                </h2>
                <p class="text-sm text-gray-600 mt-1">
                  {{ totalMatches() }} matches · {{ userPredictionsCount() }} predictions made
                </p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="setFilter('all')"
                  [class.bg-primary-600]="activeFilter() === 'all'"
                  [class.text-white]="activeFilter() === 'all'"
                  [class.bg-gray-100]="activeFilter() !== 'all'"
                  [class.text-gray-700]="activeFilter() !== 'all'"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  All
                </button>
                <button
                  (click)="setFilter('upcoming')"
                  [class.bg-primary-600]="activeFilter() === 'upcoming'"
                  [class.text-white]="activeFilter() === 'upcoming'"
                  [class.bg-gray-100]="activeFilter() !== 'upcoming'"
                  [class.text-gray-700]="activeFilter() !== 'upcoming'"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  Upcoming
                </button>
                <button
                  (click)="setFilter('finished')"
                  [class.bg-primary-600]="activeFilter() === 'finished'"
                  [class.text-white]="activeFilter() === 'finished'"
                  [class.bg-gray-100]="activeFilter() !== 'finished'"
                  [class.text-gray-700]="activeFilter() !== 'finished'"
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  Finished
                </button>
              </div>
            </div>
          </div>

          @if (filteredGroupedMatches().length === 0) {
            <div class="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p class="text-gray-600">No matches found for the selected filter</p>
            </div>
          } @else {
            <div class="space-y-8">
              @for (group of filteredGroupedMatches(); track group.gameWeek.id) {
                <div>
                  <div class="mb-4 pb-2 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">
                      Game Week {{ group.gameWeek.weekNumber }}
                    </h3>
                    <p class="text-sm text-gray-600">
                      {{ formatDate(group.gameWeek.startDate) }} - {{ formatDate(group.gameWeek.endDate) }}
                    </p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    @for (match of group.matches; track match.id) {
                      <app-match-card
                        [matchData]="match"
                        [predictionData]="match.prediction"
                      />
                    }
                  </div>
                </div>
              }
            </div>
          }
        } @else {
          <div class="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p class="text-gray-600">No active tournament found</p>
          </div>
        }
      }
    </div>
  `,
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
  private activeFilterSignal = signal<FilterType>('all');

  activeTournament = this.activeTournamentSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  activeFilter = this.activeFilterSignal.asReadonly();

  totalMatches = computed(() => this.matchesSignal().length);
  userPredictionsCount = computed(() => this.predictionsSignal().length);

  filteredMatches = computed(() => {
    const filter = this.activeFilterSignal();
    const matches = this.matchesSignal();

    if (filter === 'all') return matches;
    if (filter === 'upcoming') return matches.filter(m => !m.isFinished);
    if (filter === 'finished') return matches.filter(m => m.isFinished);
    return matches;
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

  setFilter(filter: FilterType): void {
    this.activeFilterSignal.set(filter);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
