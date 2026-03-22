import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { LeaderboardService } from './services/leaderboard.service';
import { MatchService } from '../matches/services/match.service';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { CompetitionSelectorComponent } from '../../shared/components/competition-selector/competition-selector.component';
import { LeaderboardEntry } from '../../shared/models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CompetitionSelectorComponent],
  template: `
    <div class="bg-gray-100 px-4 pt-4 pb-8">
      <div class="max-w-lg mx-auto">
        <app-competition-selector
          [competitions]="competitions()"
          [selected]="selectedCompetition()"
          (selectionChange)="onCompetitionChange($event)" />

        <!-- User Stats Card -->
        @if (currentUserEntry()) {
          <div class="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl p-4 mb-4 text-white">
            <div class="flex justify-between items-start mb-3">
              <span class="text-sm font-medium opacity-90">Your Stats</span>
              <span class="bg-white text-cyan-600 font-bold text-sm px-3 py-1 rounded-full">
                Rank #{{ currentUserEntry()!.rank }}
              </span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-2xl font-bold">{{ currentUserEntry()!.totalPoints }}</div>
                <div class="text-xs opacity-80">Points</div>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ currentUserEntry()!.totalPredictions }}</div>
                <div class="text-xs opacity-80">Predictions</div>
              </div>
              <div>
                <div class="text-2xl font-bold">{{ accuracy() }}%</div>
                <div class="text-xs opacity-80">Accuracy</div>
              </div>
            </div>
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }

        @if (!isLoading() && entries().length === 0 && !errorMessage()) {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No leaderboard data yet</h3>
            <p class="mt-1 text-sm text-gray-500">Start making predictions to appear on the leaderboard!</p>
          </div>
        }

        @if (!isLoading() && entries().length > 0) {
          <div class="space-y-2">
            @for (entry of entries(); track entry.userId) {
              <div class="bg-white rounded-xl p-3 flex items-center gap-3"
                   [class.ring-2]="isCurrentUser(entry)"
                   [class.ring-cyan-400]="isCurrentUser(entry)">
                <div class="w-8 text-center font-bold text-sm">
                  @switch (entry.rank) {
                    @case (1) { <span class="text-xl">🥇</span> }
                    @case (2) { <span class="text-xl">🥈</span> }
                    @case (3) { <span class="text-xl">🥉</span> }
                    @default { <span class="text-gray-500">#{{ entry.rank }}</span> }
                  }
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-900 text-sm">
                    {{ entry.username }}
                    @if (isCurrentUser(entry)) {
                      <span class="ml-1 text-xs text-cyan-600">(You)</span>
                    }
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ entry.totalPredictions }} predictions · {{ formatAccuracy(entry) }}% accuracy
                  </div>
                </div>
                <div class="bg-cyan-50 text-cyan-700 font-bold text-sm px-3 py-1.5 rounded-full">
                  {{ entry.totalPoints }}
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  private storage = inject(StorageService);

  competitions = signal<string[]>([]);
  selectedCompetition = signal('');
  entries = signal<LeaderboardEntry[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  currentUserId = computed(() => this.authService.currentUser()?.userId);

  currentUserEntry = computed(() =>
    this.entries().find(e => e.userId === this.currentUserId())
  );

  accuracy = computed(() => {
    const entry = this.currentUserEntry();
    if (!entry || entry.totalPredictions === 0) return '0.0';
    return ((entry.totalPoints / (entry.totalPredictions * 5)) * 100).toFixed(1);
  });

  ngOnInit(): void {
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        const selectedComps = this.storage.getObject<string[]>('selected_competitions');
        const filtered = selectedComps?.length ? codes.filter(c => selectedComps.includes(c)) : codes;
        this.competitions.set(filtered);
        const saved = this.storage.getItem('last_competition');
        const defaultComp = saved && filtered.includes(saved) ? saved : filtered[0] || '';
        if (defaultComp) {
          this.selectedCompetition.set(defaultComp);
          this.loadLeaderboard();
        }
      }
    });
  }

  onCompetitionChange(code: string): void {
    this.selectedCompetition.set(code);
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    const comp = this.selectedCompetition();
    if (!comp) return;

    this.isLoading.set(true);
    this.leaderboardService.getByCompetition(comp).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load leaderboard.');
        this.isLoading.set(false);
      }
    });
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return entry.userId === this.currentUserId();
  }

  formatAccuracy(entry: LeaderboardEntry): string {
    if (entry.totalPredictions === 0) return '0.0';
    return ((entry.totalPoints / (entry.totalPredictions * 5)) * 100).toFixed(1);
  }
}
