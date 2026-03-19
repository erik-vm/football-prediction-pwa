import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentService } from './services/tournament.service';
import { Tournament } from '../../shared/models/match.model';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Tournaments</h1>

      @if (loading()) {
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading tournaments...</p>
        </div>
      }

      @if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-800">{{ error() }}</p>
        </div>
      }

      @if (!loading() && tournaments().length === 0) {
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p class="text-yellow-800 font-medium">No tournaments available</p>
          <p class="text-yellow-600 text-sm mt-2">Check back later for new tournaments</p>
        </div>
      }

      <div class="grid gap-4">
        @for (tournament of tournaments(); track tournament.id) {
          <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-900 mb-1">
                  {{ tournament.name }}
                </h2>
                <p class="text-gray-600 text-sm mb-2">Season: {{ tournament.season }}</p>
                @if (tournament.description) {
                  <p class="text-gray-600 text-sm mb-3">{{ tournament.description }}</p>
                }
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class.bg-green-100]="tournament.isActive"
                        [class.text-green-800]="tournament.isActive"
                        [class.bg-gray-100]="!tournament.isActive"
                        [class.text-gray-800]="!tournament.isActive">
                    {{ tournament.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col gap-2 ml-4">
                <a [routerLink]="['/matches']"
                   [queryParams]="{tournamentId: tournament.id}"
                   class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium">
                  View Matches
                </a>
                <a [routerLink]="['/leaderboard']"
                   [queryParams]="{tournamentId: tournament.id}"
                   class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center text-sm font-medium">
                  Leaderboard
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TournamentListComponent implements OnInit {
  private tournamentService = inject(TournamentService);

  tournaments = signal<Tournament[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTournaments();
  }

  private loadTournaments(): void {
    this.loading.set(true);
    this.error.set(null);

    this.tournamentService.getAll().subscribe({
      next: (tournaments) => {
        this.tournaments.set(tournaments);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load tournaments');
        this.loading.set(false);
        console.error('Error loading tournaments:', err);
      }
    });
  }
}
