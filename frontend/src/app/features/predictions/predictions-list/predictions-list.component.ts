import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { CompetitionPreferenceService } from '../../../core/services/competition-preference.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { Match } from '../../../core/models/match.model';
import { Competition } from '../../../core/models/competition.model';
import { Prediction } from '../../../core/models/prediction.model';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchStatus } from '../../../shared/components/match-status-tabs/match-status-tabs.component';
import { MatchdayFilterComponent } from '../../../shared/components/matchday-filter/matchday-filter.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CompetitionSelectorComponent } from '../../../shared/components/competition-selector/competition-selector.component';
import { TabNavigationComponent, TabType } from '../../../shared/components/tab-navigation/tab-navigation.component';

interface MatchWithPrediction extends Match {
  prediction?: Prediction;
}

@Component({
  selector: 'app-predictions-list',
  standalone: true,
  imports: [
    CommonModule,
    MatchCardComponent,
    MatchdayFilterComponent,
    HeaderComponent,
    CompetitionSelectorComponent,
    TabNavigationComponent
  ],
  templateUrl: './predictions-list.component.html',
  styles: []
})
export class PredictionsListComponent implements OnInit, OnDestroy {
  private matchService = inject(MatchService);
  private predictionService = inject(PredictionService);
  private competitionService = inject(CompetitionService);
  private preferenceService = inject(CompetitionPreferenceService);
  private signalRService = inject(SignalRService);
  private router = inject(Router);

  private matchesSignal = signal<MatchWithPrediction[]>([]);
  private predictionsSignal = signal<Prediction[]>([]);
  private isLoadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);
  private activeStatusTabSignal = signal<MatchStatus>('upcoming');
  private selectedMatchdaySignal = signal<number | null>(null);
  private selectedCompetitionSignal = signal<string>(
    typeof localStorage !== 'undefined' ? localStorage.getItem('selectedCompetition') || 'PL' : 'PL'
  );

  private autoRefreshIntervalId: any = null;
  private matchUpdateCallback: ((matchId: string) => void) | null = null;

  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  activeStatusTab = this.activeStatusTabSignal.asReadonly();
  selectedMatchday = this.selectedMatchdaySignal.asReadonly();
  selectedCompetition = this.selectedCompetitionSignal.asReadonly();

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

  getPredictionForMatch(matchId: string) {
    const matches = this.matchesSignal();
    const match = matches.find(m => m.id === matchId);
    return match?.prediction || null;
  }

  ngOnInit(): void {
    this.competitionService.getCompetitions(true).subscribe();
    this.preferenceService.getUserPreferences().subscribe();
    this.loadData();
    this.setupSignalRListeners();
    this.setupRouterListener();
  }

  ngOnDestroy(): void {
    this.clearAutoRefresh();
    if (this.matchUpdateCallback) {
      this.signalRService.removeMatchUpdateCallback(this.matchUpdateCallback);
    }
  }

  private setupSignalRListeners(): void {
    this.matchUpdateCallback = (matchId: string) => {
      this.refreshMatchData(matchId);
    };
    this.signalRService.onMatchUpdate(this.matchUpdateCallback);
  }

  private setupRouterListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/predictions' || event.url.startsWith('/predictions?')) {
        this.loadPredictions();
      }
    });
  }

  private refreshMatchData(matchId: string): void {
    this.matchService.getMatch(matchId).subscribe({
      next: (response) => {
        if (response.data) {
          const matches = this.matchesSignal();
          const index = matches.findIndex(m => m.id === matchId);
          if (index > -1) {
            const updatedMatches = [...matches];
            updatedMatches[index] = { ...response.data, prediction: matches[index].prediction };
            this.matchesSignal.set(updatedMatches);
          }
        }
      },
      error: (error) => {
        console.error('Failed to refresh match data:', error);
      }
    });
  }

  loadData(): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const competitionCode = this.selectedCompetitionSignal();
    this.matchService.getMatches({ competitionCode }).subscribe({
      next: (response) => {
        if (response.data) {
          this.matchesSignal.set(response.data);
          this.loadPredictions();
        } else {
          this.matchesSignal.set([]);
          this.isLoadingSignal.set(false);
        }
      },
      error: (error) => {
        console.error('Failed to load matches:', error);
        this.errorSignal.set(error.message || 'Failed to load matches');
        this.matchesSignal.set([]);
        this.isLoadingSignal.set(false);
      }
    });
  }

  private loadPredictions(): void {
    this.predictionService.getUserPredictions().subscribe({
      next: (response) => {
        if (response.data) {
          this.predictionsSignal.set(response.data);
          this.mergePredictionsWithMatches();
        } else {
          this.predictionsSignal.set([]);
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Failed to load predictions:', error);
        this.predictionsSignal.set([]);
        this.checkLoadingComplete();
      }
    });
  }

  private mergePredictionsWithMatches(): void {
    const matches = this.matchesSignal();
    const predictions = this.predictionsSignal();

    const predictionMap = new Map(
      predictions.map(p => [p.matchId, p])
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
    this.clearAutoRefresh();

    if (status === 'live') {
      this.startAutoRefresh();
    }
  }

  onTabChange(tab: TabType): void {
    const statusMapping: Record<TabType, MatchStatus> = {
      'upcoming': 'upcoming',
      'live': 'live',
      'completed': 'completed'
    };
    this.onStatusTabChange(statusMapping[tab]);
  }

  mapStatusToTab(status: MatchStatus): TabType {
    const tabMapping: Record<MatchStatus, TabType> = {
      'upcoming': 'upcoming',
      'live': 'live',
      'completed': 'completed'
    };
    return tabMapping[status];
  }

  private startAutoRefresh(): void {
    this.clearAutoRefresh();

    this.autoRefreshIntervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.refreshLiveMatches();
      }
    }, 30000);
  }

  private clearAutoRefresh(): void {
    if (this.autoRefreshIntervalId) {
      clearInterval(this.autoRefreshIntervalId);
      this.autoRefreshIntervalId = null;
    }
  }

  private refreshLiveMatches(): void {
    const now = new Date();
    const liveMatches = this.matchesSignal().filter(m =>
      !m.isFinished && new Date(m.kickoffTime) <= now
    );

    liveMatches.forEach(match => {
      this.refreshMatchData(match.id);
    });
  }

  onMatchdayChange(matchday: number | null): void {
    this.selectedMatchdaySignal.set(matchday);
  }

  onCompetitionChange(competitionCode: string): void {
    this.selectedCompetitionSignal.set(competitionCode);
    this.selectedMatchdaySignal.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedCompetition', competitionCode);
    }
    this.loadData();
  }
}
