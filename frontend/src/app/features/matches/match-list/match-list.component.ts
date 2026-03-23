import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { StorageService } from '../../../core/services/storage.service';
import { MatchDto } from '../../../shared/models/match.model';
import { PredictionDto } from '../../../shared/models/prediction.model';

type Tab = 'upcoming' | 'live' | 'completed';

interface CompetitionOption {
  code: string;
  name: string;
}

const COMPETITION_NAMES: Record<string, string> = {
  PL: 'Premier League', PD: 'La Liga', BL1: 'Bundesliga', SA: 'Serie A',
  FL1: 'Ligue 1', CL: 'Champions League', PPL: 'Primeira Liga',
  DED: 'Eredivisie', ELC: 'Championship', BSA: 'Brasileirao',
  WC: 'FIFA World Cup', EC: 'European Championship'
};

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [FormsModule, MatchCardComponent],
  templateUrl: './match-list.component.html'
})
export class MatchListComponent implements OnInit {
  activeTab = signal<Tab>('upcoming');
  matches = signal<MatchDto[]>([]);
  competitions = signal<CompetitionOption[]>([]);
  matchdays = signal<number[]>([]);
  predictions = signal<Map<string, PredictionDto>>(new Map());
  selectedCompetition = '';
  selectedMatchday = 0;
  loading = signal(false);

  private readonly COMP_KEY = 'last_selected_competition';
  private readonly PREFS_KEY = 'selected_competitions';

  constructor(
    private matchService: MatchService,
    private predictionService: PredictionService,
    private storage: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompetitions();
    this.loadUserPredictions();
  }

  private loadUserPredictions(): void {
    this.predictionService.getMyPredictions().subscribe({
      next: (preds) => {
        const map = new Map<string, PredictionDto>();
        preds.forEach(p => map.set(p.matchId, p));
        this.predictions.set(map);
      }
    });
  }

  getPrediction(matchId: string): PredictionDto | null {
    return this.predictions().get(matchId) ?? null;
  }

  private loadCompetitions(): void {
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        const preferredCodes = this.storage.getJson<string[]>(this.PREFS_KEY);
        const filtered = preferredCodes && preferredCodes.length > 0
          ? codes.filter(c => preferredCodes.includes(c))
          : codes;

        this.competitions.set(
          filtered.map(code => ({ code, name: COMPETITION_NAMES[code] || code }))
        );

        if (filtered.length > 0) {
          const lastSelected = this.storage.get(this.COMP_KEY);
          this.selectedCompetition = lastSelected && filtered.includes(lastSelected)
            ? lastSelected
            : filtered[0];
          this.loadNearestMatchday();
        }
      }
    });
  }

  private loadNearestMatchday(): void {
    this.matchService.getNearestMatchday(this.selectedCompetition, this.activeTab()).subscribe({
      next: (matchday) => {
        this.selectedMatchday = matchday;
        this.loadMatchdays();
        this.loadMatches();
      }
    });
  }

  private loadMatchdays(): void {
    this.matchService.getMatchdays(this.selectedCompetition).subscribe({
      next: (days) => this.matchdays.set(days)
    });
  }

  loadMatches(): void {
    if (!this.selectedCompetition || !this.selectedMatchday) return;
    this.loading.set(true);
    this.matchService.getFiltered(this.selectedCompetition, this.selectedMatchday).subscribe({
      next: (matches) => {
        this.matches.set(this.filterByTab(matches));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private filterByTab(matches: MatchDto[]): MatchDto[] {
    switch (this.activeTab()) {
      case 'upcoming':
        return matches.filter(m => !m.isFinished && m.status !== 'IN_PLAY');
      case 'live':
        return matches.filter(m => m.status === 'IN_PLAY');
      case 'completed':
        return matches.filter(m => m.isFinished);
    }
  }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.loadNearestMatchday();
  }

  onCompetitionChange(): void {
    this.storage.set(this.COMP_KEY, this.selectedCompetition);
    this.loadNearestMatchday();
  }

  onMatchdayChange(): void {
    this.loadMatches();
  }

  onPredict(match: MatchDto): void {
    this.router.navigate(['/predict', match.id]);
  }
}
