import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchAdminService } from '../../../core/services/admin/match-admin.service';
import { ResultAdminService } from '../../../core/services/admin/result-admin.service';
import { Match } from '../../../core/models/match.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface MatchWithResult extends Match {
  enteredHomeScore?: number;
  enteredAwayScore?: number;
}

@Component({
  selector: 'app-result-entry',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Enter Results</h1>
        <p class="mt-2 text-sm text-gray-600">Submit match results to calculate prediction points</p>
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

      @if (finishedMatches().length === 0 && !isLoading()) {
        <div class="bg-white shadow sm:rounded-lg p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">All results entered</h3>
          <p class="mt-1 text-sm text-gray-500">There are no finished matches without results.</p>
        </div>
      } @else {
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="divide-y divide-gray-200">
            @for (match of finishedMatches(); track match.id) {
              <div class="p-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900">
                      {{ match.homeTeam }} vs {{ match.awayTeam }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      {{ formatDate(match.kickoffTime) }} at {{ formatTime(match.kickoffTime) }}
                    </p>
                  </div>

                  <div class="flex items-center space-x-4">
                    <div class="flex items-center space-x-2">
                      <label class="text-sm font-medium text-gray-700">{{ match.homeTeam }}:</label>
                      <input
                        type="number"
                        [(ngModel)]="match.enteredHomeScore"
                        min="0"
                        class="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <span class="text-gray-400">-</span>

                    <div class="flex items-center space-x-2">
                      <input
                        type="number"
                        [(ngModel)]="match.enteredAwayScore"
                        min="0"
                        class="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                      <label class="text-sm font-medium text-gray-700">:{{ match.awayTeam }}</label>
                    </div>

                    <button
                      (click)="confirmSubmit(match)"
                      [disabled]="match.enteredHomeScore === undefined || match.enteredAwayScore === undefined"
                      class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [isOpen]="showConfirmDialog()"
      [title]="'Submit Result'"
      [message]="'This will calculate points for all predictions on this match. This action cannot be undone. Continue?'"
      [confirmText]="'Submit Result'"
      [cancelText]="'Cancel'"
      (confirm)="submitResult()"
      (cancel)="cancelSubmit()"
    />
  `
})
export class ResultEntryComponent implements OnInit {
  private matchAdminService = inject(MatchAdminService);
  private resultService = inject(ResultAdminService);

  finishedMatches = signal<MatchWithResult[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showConfirmDialog = signal(false);
  matchToSubmit = signal<MatchWithResult | null>(null);

  ngOnInit(): void {
    this.loadFinishedMatches();
  }

  private loadFinishedMatches(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.matchAdminService.getAllMatches().subscribe({
      next: (response) => {
        const allMatches = response.data ?? [];
        const finishedWithoutResults = allMatches.filter(
          match => match.isFinished && (match.homeScore === undefined || match.homeScore === null)
        );
        this.finishedMatches.set(finishedWithoutResults);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load matches');
        this.isLoading.set(false);
      }
    });
  }

  confirmSubmit(match: MatchWithResult): void {
    this.matchToSubmit.set(match);
    this.showConfirmDialog.set(true);
  }

  submitResult(): void {
    const match = this.matchToSubmit();
    if (!match || match.enteredHomeScore === undefined || match.enteredAwayScore === undefined) {
      this.showConfirmDialog.set(false);
      return;
    }

    const request = {
      matchId: match.id,
      homeScore: match.enteredHomeScore,
      awayScore: match.enteredAwayScore
    };

    this.resultService.submitResult(request).subscribe({
      next: (response) => {
        const predictionsCalculated = response.data?.predictionsCalculated ?? 0;
        this.successMessage.set(
          `Result submitted successfully. ${predictionsCalculated} prediction${predictionsCalculated !== 1 ? 's' : ''} calculated.`
        );
        setTimeout(() => this.successMessage.set(null), 5000);
        this.showConfirmDialog.set(false);
        this.matchToSubmit.set(null);
        this.loadFinishedMatches();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to submit result');
        setTimeout(() => this.error.set(null), 3000);
        this.showConfirmDialog.set(false);
      }
    });
  }

  cancelSubmit(): void {
    this.showConfirmDialog.set(false);
    this.matchToSubmit.set(null);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
