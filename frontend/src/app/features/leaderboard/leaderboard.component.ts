import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LeaderboardService } from './services/leaderboard.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardEntry } from '../../shared/models/leaderboard.model';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p class="mt-2 text-sm text-gray-600">
            See who's leading the pack
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage()" class="rounded-md bg-red-50 p-4 mb-6">
          <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && entries().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No leaderboard data yet</h3>
          <p class="mt-1 text-sm text-gray-500">Start making predictions to appear on the leaderboard!</p>
        </div>

        <!-- Leaderboard Table -->
        <div *ngIf="!isLoading() && entries().length > 0" class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Points
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predictions
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Points
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let entry of entries(); let i = index"
                    [class.bg-blue-50]="isCurrentUser(entry)"
                    class="hover:bg-gray-50 transition-colors">
                  <!-- Rank -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span *ngIf="getRankDisplay(i + 1) === '🥇'" class="text-2xl">🥇</span>
                      <span *ngIf="getRankDisplay(i + 1) === '🥈'" class="text-2xl">🥈</span>
                      <span *ngIf="getRankDisplay(i + 1) === '🥉'" class="text-2xl">🥉</span>
                      <span *ngIf="getRankDisplay(i + 1) !== '🥇' && getRankDisplay(i + 1) !== '🥈' && getRankDisplay(i + 1) !== '🥉'"
                            class="text-sm font-medium text-gray-900">
                        #{{ i + 1 }}
                      </span>
                    </div>
                  </td>
                  <!-- Username -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-sm font-medium text-gray-900">
                        {{ entry.username }}
                        <span *ngIf="isCurrentUser(entry)" class="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          You
                        </span>
                      </div>
                    </div>
                  </td>
                  <!-- Total Points -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">{{ entry.totalPoints }}</div>
                  </td>
                  <!-- Total Predictions -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ entry.totalPredictions }}</div>
                  </td>
                  <!-- Average Points -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatAccuracy(entry) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LeaderboardComponent implements OnInit {
  private leaderboardService = inject(LeaderboardService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  entries = signal<LeaderboardEntry[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  tournamentId = signal<string | null>(null);
  currentUserId = computed(() => this.authService.currentUser()?.userId);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tournamentId.set(params['tournamentId'] || null);
      this.loadLeaderboard();
    });
  }

  loadLeaderboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const tournamentId = this.tournamentId();
    const request = tournamentId
      ? this.leaderboardService.getByTournament(tournamentId)
      : this.leaderboardService.getOverall();

    request.subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load leaderboard. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading leaderboard:', error);
      }
    });
  }

  isCurrentUser(entry: LeaderboardEntry): boolean {
    return entry.userId === this.currentUserId();
  }

  getRankDisplay(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  formatAccuracy(entry: LeaderboardEntry): string {
    if (entry.totalPredictions === 0) return '0.0';
    return entry.averagePoints.toFixed(1);
  }
}
