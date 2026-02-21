import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchAdminService } from '../../../core/services/admin/match-admin.service';
import { TournamentAdminService } from '../../../core/services/admin/tournament-admin.service';
import { MatchService } from '../../../core/services/match.service';
import { Match, Tournament, GameWeek, TournamentStage } from '../../../core/models/match.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Matches</h1>
          <p class="mt-2 text-sm text-gray-600">Manage all matches</p>
        </div>
        <a
          routerLink="/admin/matches/new"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Match
        </a>
      </div>

      <div class="bg-white shadow sm:rounded-lg p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="tournament" class="block text-sm font-medium text-gray-700 mb-2">Filter by Tournament</label>
            <select
              id="tournament"
              [(ngModel)]="selectedTournamentId"
              (change)="onTournamentChange()"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Tournaments</option>
              @for (tournament of tournaments(); track tournament.id) {
                <option [value]="tournament.id">{{ tournament.name }} ({{ tournament.year }})</option>
              }
            </select>
          </div>

          <div>
            <label for="gameweek" class="block text-sm font-medium text-gray-700 mb-2">Filter by Game Week</label>
            <select
              id="gameweek"
              [(ngModel)]="selectedGameWeekId"
              (change)="onGameWeekChange()"
              [disabled]="!selectedTournamentId"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">All Game Weeks</option>
              @for (gameWeek of gameWeeks(); track gameWeek.id) {
                <option [value]="gameWeek.id">Week {{ gameWeek.weekNumber }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-800">{{ error() }}</p>
        </div>
      } @else if (successMessage()) {
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p class="text-green-800">{{ successMessage() }}</p>
        </div>
      }

      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kickoff
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            @if (matches().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-sm text-gray-500">
                  No matches found. Add your first match to get started.
                </td>
              </tr>
            }
            @for (match of matches(); track match.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ match.homeTeam }} vs {{ match.awayTeam }}</div>
                  @if (match.isFinished && match.homeScore !== undefined && match.awayScore !== undefined) {
                    <div class="text-sm text-gray-500">Result: {{ match.homeScore }} - {{ match.awayScore }}</div>
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ formatDate(match.kickoffTime) }}</div>
                  <div class="text-xs text-gray-500">{{ formatTime(match.kickoffTime) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">{{ formatStage(match.stage) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  @if (match.isFinished) {
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Finished
                    </span>
                  } @else {
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Upcoming
                    </span>
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a
                    [routerLink]="['/admin/matches', match.id, 'edit']"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </a>
                  <button
                    (click)="confirmDelete(match)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <app-confirm-dialog
      [isOpen]="showDeleteDialog()"
      [title]="'Delete Match'"
      [message]="'Are you sure you want to delete this match? This action cannot be undone and will delete all associated predictions.'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      (confirm)="deleteMatch()"
      (cancel)="cancelDelete()"
    />
  `
})
export class MatchListComponent implements OnInit {
  private matchAdminService = inject(MatchAdminService);
  private tournamentService = inject(TournamentAdminService);
  private matchService = inject(MatchService);

  matches = signal<Match[]>([]);
  tournaments = signal<Tournament[]>([]);
  gameWeeks = signal<GameWeek[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  matchToDelete = signal<Match | null>(null);

  selectedTournamentId: string = '';
  selectedGameWeekId: string = '';

  ngOnInit(): void {
    this.loadTournaments();
    this.loadMatches();
  }

  private loadTournaments(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (response) => {
        this.tournaments.set(response.data ?? []);
      },
      error: (err) => {
        console.error('Failed to load tournaments', err);
      }
    });
  }

  private loadMatches(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.matchAdminService.getAllMatches().subscribe({
      next: (response) => {
        this.matches.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load matches');
        this.isLoading.set(false);
      }
    });
  }

  onTournamentChange(): void {
    if (this.selectedTournamentId) {
      this.loadGameWeeks();
      this.loadMatchesByTournament();
    } else {
      this.gameWeeks.set([]);
      this.selectedGameWeekId = '';
      this.loadMatches();
    }
  }

  onGameWeekChange(): void {
    if (this.selectedGameWeekId) {
      this.loadMatchesByGameWeek();
    } else if (this.selectedTournamentId) {
      this.loadMatchesByTournament();
    } else {
      this.loadMatches();
    }
  }

  private loadGameWeeks(): void {
    this.matchService.getGameWeeks(this.selectedTournamentId).subscribe({
      next: (response) => {
        this.gameWeeks.set(response.data ?? []);
      },
      error: (err) => {
        console.error('Failed to load game weeks', err);
      }
    });
  }

  private loadMatchesByTournament(): void {
    this.isLoading.set(true);
    this.matchAdminService.getMatchesByTournament(this.selectedTournamentId).subscribe({
      next: (response) => {
        this.matches.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load matches');
        this.isLoading.set(false);
      }
    });
  }

  private loadMatchesByGameWeek(): void {
    this.isLoading.set(true);
    this.matchAdminService.getMatchesByGameWeek(this.selectedGameWeekId).subscribe({
      next: (response) => {
        this.matches.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load matches');
        this.isLoading.set(false);
      }
    });
  }

  confirmDelete(match: Match): void {
    this.matchToDelete.set(match);
    this.showDeleteDialog.set(true);
  }

  deleteMatch(): void {
    const match = this.matchToDelete();
    if (!match) return;

    this.matchAdminService.deleteMatch(match.id).subscribe({
      next: () => {
        this.successMessage.set('Match deleted successfully');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.showDeleteDialog.set(false);
        this.matchToDelete.set(null);
        this.loadMatches();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete match');
        setTimeout(() => this.error.set(null), 3000);
        this.showDeleteDialog.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.matchToDelete.set(null);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatStage(stage: TournamentStage): string {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
