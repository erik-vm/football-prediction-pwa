import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TournamentAdminService } from '../../../core/services/admin/tournament-admin.service';
import { Tournament } from '../../../core/models/match.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p class="mt-2 text-sm text-gray-600">Manage all tournaments</p>
        </div>
        <a
          routerLink="/admin/tournaments/new"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create Tournament
        </a>
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
                Name
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
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
            @if (tournaments().length === 0) {
              <tr>
                <td colspan="4" class="px-6 py-12 text-center text-sm text-gray-500">
                  No tournaments found. Create your first tournament to get started.
                </td>
              </tr>
            }
            @for (tournament of tournaments(); track tournament.id) {
              <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ tournament.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ tournament.year }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  @if (tournament.isActive) {
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  } @else {
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <a
                    [routerLink]="['/admin/tournaments', tournament.id, 'edit']"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </a>
                  <button
                    (click)="toggleActivation(tournament)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    {{ tournament.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    (click)="confirmDelete(tournament)"
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
      [title]="'Delete Tournament'"
      [message]="'Are you sure you want to delete this tournament? This action cannot be undone and will delete all associated matches and predictions.'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      (confirm)="deleteTournament()"
      (cancel)="cancelDelete()"
    />
  `
})
export class TournamentListComponent implements OnInit {
  private tournamentService = inject(TournamentAdminService);

  tournaments = signal<Tournament[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showDeleteDialog = signal(false);
  tournamentToDelete = signal<Tournament | null>(null);

  ngOnInit(): void {
    this.loadTournaments();
  }

  private loadTournaments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tournamentService.getAllTournaments().subscribe({
      next: (response) => {
        this.tournaments.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load tournaments');
        this.isLoading.set(false);
      }
    });
  }

  toggleActivation(tournament: Tournament): void {
    const action = tournament.isActive
      ? this.tournamentService.deactivateTournament(tournament.id)
      : this.tournamentService.activateTournament(tournament.id);

    action.subscribe({
      next: () => {
        this.successMessage.set(`Tournament ${tournament.isActive ? 'deactivated' : 'activated'} successfully`);
        setTimeout(() => this.successMessage.set(null), 3000);
        this.loadTournaments();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to update tournament');
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  confirmDelete(tournament: Tournament): void {
    this.tournamentToDelete.set(tournament);
    this.showDeleteDialog.set(true);
  }

  deleteTournament(): void {
    const tournament = this.tournamentToDelete();
    if (!tournament) return;

    this.tournamentService.deleteTournament(tournament.id).subscribe({
      next: () => {
        this.successMessage.set('Tournament deleted successfully');
        setTimeout(() => this.successMessage.set(null), 3000);
        this.showDeleteDialog.set(false);
        this.tournamentToDelete.set(null);
        this.loadTournaments();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete tournament');
        setTimeout(() => this.error.set(null), 3000);
        this.showDeleteDialog.set(false);
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog.set(false);
    this.tournamentToDelete.set(null);
  }
}
