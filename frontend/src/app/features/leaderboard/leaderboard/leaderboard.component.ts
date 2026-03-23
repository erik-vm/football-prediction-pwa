import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { LeaderboardService } from '../../../core/services/leaderboard.service';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { LeaderboardEntryDto } from '../../../shared/models/leaderboard.model';

const COMPETITION_NAMES: Record<string, string> = {
  PL: 'Premier League', PD: 'La Liga', BL1: 'Bundesliga', SA: 'Serie A',
  FL1: 'Ligue 1', CL: 'Champions League', PPL: 'Primeira Liga',
  DED: 'Eredivisie', ELC: 'Championship', BSA: 'Brasileirao',
  WC: 'FIFA World Cup', EC: 'European Championship'
};

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './leaderboard.component.html'
})
export class LeaderboardComponent implements OnInit {
  entries = signal<LeaderboardEntryDto[]>([]);
  myStats = signal<LeaderboardEntryDto | null>(null);
  competitions = signal<{ code: string; name: string }[]>([]);
  selectedCompetition = '';
  loading = signal(false);

  private readonly COMP_KEY = 'last_selected_competition';
  private readonly PREFS_KEY = 'selected_competitions';

  constructor(
    private leaderboardService: LeaderboardService,
    private matchService: MatchService,
    private authService: AuthService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        const preferredCodes = this.storage.getJson<string[]>(this.PREFS_KEY);
        const filtered = preferredCodes && preferredCodes.length > 0
          ? codes.filter(c => preferredCodes.includes(c))
          : codes;

        this.competitions.set(filtered.map(c => ({ code: c, name: COMPETITION_NAMES[c] || c })));

        if (filtered.length > 0) {
          const lastSelected = this.storage.get(this.COMP_KEY);
          this.selectedCompetition = lastSelected && filtered.includes(lastSelected)
            ? lastSelected
            : filtered[0];
          this.loadLeaderboard();
        }
      }
    });
  }

  onCompetitionChange(): void {
    this.storage.set(this.COMP_KEY, this.selectedCompetition);
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    if (!this.selectedCompetition) return;
    this.loading.set(true);
    this.leaderboardService.getByCompetition(this.selectedCompetition).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        const userId = this.authService.user()?.userId;
        this.myStats.set(entries.find(e => e.userId === userId) || null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getMedalEmoji(rank: number): string {
    if (rank === 1) return '\uD83E\uDD47';
    if (rank === 2) return '\uD83E\uDD48';
    if (rank === 3) return '\uD83E\uDD49';
    return `#${rank}`;
  }
}
