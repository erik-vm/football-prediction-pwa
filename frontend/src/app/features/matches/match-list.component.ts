import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchService } from './services/match.service';
import { PredictionService } from '../predictions/services/prediction.service';
import { MatchCardComponent } from './match-card.component';
import { TabNavigationComponent, Tab } from '../../shared/components/tab-navigation/tab-navigation.component';
import { CompetitionSelectorComponent } from '../../shared/components/competition-selector/competition-selector.component';
import { MatchdayFilterComponent } from '../../shared/components/matchday-filter/matchday-filter.component';
import { StorageService } from '../../core/services/storage.service';
import { Match } from '../../shared/models/match.model';
import { Prediction } from '../../shared/models/prediction.model';

type TabType = 'upcoming' | 'live' | 'completed';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [MatchCardComponent, TabNavigationComponent, CompetitionSelectorComponent, MatchdayFilterComponent],
  template: `
    <div class="bg-gray-100 px-4 pt-4">
      <div class="max-w-7xl mx-auto">
        <app-competition-selector
          [competitions]="competitions()"
          [selected]="selectedCompetition()"
          (selectionChange)="onCompetitionChange($event)" />

        <app-tab-navigation
          [tabs]="tabs()"
          [activeTab]="activeTab()"
          (tabChange)="selectTab($event)" />

        @if (selectedCompetition()) {
          <app-matchday-filter
            [matchdays]="matchdays()"
            [selected]="selectedMatchday()"
            (selectionChange)="onMatchdayChange($event)" />
        }

        @if (isLoading()) {
          <div class="flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }

        @if (errorMessage()) {
          <div class="rounded-md bg-red-50 p-4 mb-4 mt-4">
            <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
          </div>
        }

        @if (!isLoading() && currentMatches().length === 0 && !errorMessage()) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
            <p class="mt-1 text-sm text-gray-500">{{ emptyMessage() }}</p>
          </div>
        }

        @if (!isLoading() && currentMatches().length > 0) {
          <div class="space-y-3 mt-4 pb-4">
            @for (match of currentMatches(); track match.id) {
              <app-match-card
                [match]="match"
                [prediction]="getPrediction(match.id)"
                (predict)="onPredict($event)"
                (cardClick)="onCardClick($event)" />
            }
          </div>
        }
      </div>
    </div>
  `
})
export class MatchListComponent implements OnInit {
  private matchService = inject(MatchService);
  private predictionService = inject(PredictionService);
  private storage = inject(StorageService);
  private router = inject(Router);

  private readonly COMP_KEY = 'last_competition';

  activeTab = signal<TabType>('upcoming');
  predictions = signal<Prediction[]>([]);
  allMatches = signal<Match[]>([]);
  competitions = signal<string[]>([]);
  matchdays = signal<number[]>([]);
  selectedCompetition = signal('');
  selectedMatchday = signal<number | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  upcomingMatches = computed(() =>
    this.allMatches().filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED')
  );

  liveMatches = computed(() =>
    this.allMatches().filter(m => m.status === 'IN_PLAY' || m.status === 'PAUSED')
  );

  completedMatches = computed(() =>
    this.allMatches().filter(m => m.status === 'FINISHED')
  );

  tabs = computed<Tab[]>(() => [
    { key: 'upcoming', label: 'Upcoming', count: this.upcomingMatches().length },
    { key: 'live', label: 'Live', count: this.liveMatches().length },
    { key: 'completed', label: 'Completed', count: this.completedMatches().length }
  ]);

  currentMatches = computed(() => {
    switch (this.activeTab()) {
      case 'upcoming': return this.upcomingMatches();
      case 'live': return this.liveMatches();
      case 'completed': return this.completedMatches();
    }
  });

  emptyMessage = computed(() => {
    switch (this.activeTab()) {
      case 'upcoming': return 'There are no upcoming matches at the moment.';
      case 'live': return 'No live matches right now.';
      case 'completed': return 'No completed matches yet.';
    }
  });

  ngOnInit(): void {
    this.loadPredictions();
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        const selectedComps = this.storage.getObject<string[]>('selected_competitions');
        const filtered = selectedComps && selectedComps.length > 0
          ? codes.filter(c => selectedComps.includes(c))
          : codes;
        this.competitions.set(filtered);
        const saved = this.storage.getItem(this.COMP_KEY);
        const defaultComp = saved && filtered.includes(saved) ? saved : filtered[0] || '';
        if (defaultComp) {
          this.selectedCompetition.set(defaultComp);
          this.storage.setItem(this.COMP_KEY, defaultComp);
          this.loadMatchdays();
          this.autoSelectMatchdayAndLoad();
        }
      },
      error: () => this.loadMatches()
    });
  }

  selectTab(tab: string): void {
    this.activeTab.set(tab as TabType);
    if (this.selectedCompetition()) {
      this.autoSelectMatchdayAndLoad();
    }
  }

  onCompetitionChange(code: string): void {
    this.selectedCompetition.set(code);
    if (code) {
      this.storage.setItem(this.COMP_KEY, code);
    }
    this.selectedMatchday.set(null);
    this.loadMatchdays();
    if (code) {
      this.autoSelectMatchdayAndLoad();
    } else {
      this.loadMatches();
    }
  }

  onMatchdayChange(matchday: number | null): void {
    this.selectedMatchday.set(matchday);
    this.loadMatches();
  }

  private autoSelectMatchdayAndLoad(): void {
    const comp = this.selectedCompetition();
    if (!comp) { this.loadMatches(); return; }

    this.matchService.getNearestMatchday(comp, this.activeTab()).subscribe({
      next: (day) => {
        this.selectedMatchday.set(day);
        this.loadMatches();
      },
      error: () => this.loadMatches()
    });
  }

  private loadMatchdays(): void {
    const comp = this.selectedCompetition() || undefined;
    this.matchService.getMatchdays(comp).subscribe({
      next: (days) => this.matchdays.set(days),
      error: () => {}
    });
  }

  loadMatches(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const comp = this.selectedCompetition() || undefined;
    const day = this.selectedMatchday() ?? undefined;

    if (comp || day) {
      this.matchService.getFiltered(comp, day).subscribe({
        next: (matches) => {
          this.allMatches.set(matches);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load matches.');
          this.isLoading.set(false);
        }
      });
    } else {
      forkJoin({
        upcoming: this.matchService.getUpcoming(),
        finished: this.matchService.getFinished()
      }).subscribe({
        next: ({ upcoming, finished }) => {
          this.allMatches.set([...upcoming, ...finished]);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to load matches.');
          this.isLoading.set(false);
        }
      });
    }
  }

  getPrediction(matchId: string): Prediction | undefined {
    return this.predictions().find(p => p.matchId === matchId);
  }

  private loadPredictions(): void {
    this.predictionService.getMyPredictions().subscribe({
      next: (preds) => this.predictions.set(preds),
      error: () => {}
    });
  }

  onPredict(match: Match): void {
    this.router.navigate(['/predictions', 'new'], { queryParams: { matchId: match.id } });
  }

  onCardClick(match: Match): void {}
}
