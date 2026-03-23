import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchCardComponent } from '../match-card/match-card.component';
import { MatchService } from '../../../core/services/match.service';
import { MatchDto } from '../../../shared/models/match.model';

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
  selectedCompetition = '';
  selectedMatchday = 0;
  loading = signal(false);

  constructor(private matchService: MatchService, private router: Router) {}

  ngOnInit(): void {
    this.loadCompetitions();
  }

  private loadCompetitions(): void {
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        this.competitions.set(
          codes.map(code => ({ code, name: COMPETITION_NAMES[code] || code }))
        );
        if (codes.length > 0) {
          this.selectedCompetition = codes[0];
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
    this.loadNearestMatchday();
  }

  onMatchdayChange(): void {
    this.loadMatches();
  }

  onPredict(match: MatchDto): void {
    this.router.navigate(['/predict', match.id]);
  }
}
