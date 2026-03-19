import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PredictionService } from './services/prediction.service';
import { Prediction } from '../../shared/models/prediction.model';

interface PredictionWithMatch extends Prediction {
  match?: {
    homeTeam: string;
    awayTeam: string;
    kickoffTime: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
  };
}

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">My Predictions</h1>
          <p class="mt-2 text-sm text-gray-600">
            View and manage your match predictions
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
        <div *ngIf="!isLoading() && predictions().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
          <p class="mt-1 text-sm text-gray-500">Start making predictions for upcoming matches.</p>
          <div class="mt-6">
            <button (click)="goToMatches()"
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Browse Matches
            </button>
          </div>
        </div>

        <!-- Predictions List -->
        <div *ngIf="!isLoading() && predictions().length > 0" class="space-y-4">
          <div *ngFor="let prediction of predictions()"
               class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">

            <!-- Match Info (Simplified - will enhance when we add match data) -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex-1">
                <div class="text-sm text-gray-500">Match ID: {{ prediction.matchId }}</div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ formatDate(prediction.createdAt) }}
                </div>
              </div>
              <span [class]="getStatusBadgeClass(prediction.status)">
                {{ prediction.status }}
              </span>
            </div>

            <!-- Prediction Scores -->
            <div class="grid grid-cols-3 gap-4 items-center mb-4">
              <div class="text-center">
                <div class="text-sm text-gray-600 mb-1">Your Prediction</div>
                <div class="text-2xl font-bold text-gray-900">
                  {{ prediction.homeScore }} : {{ prediction.awayScore }}
                </div>
              </div>
              <div class="text-center text-gray-400">→</div>
              <div class="text-center">
                <div class="text-sm text-gray-600 mb-1">Points Earned</div>
                <div class="text-2xl font-bold"
                     [class.text-green-600]="prediction.pointsEarned !== null && prediction.pointsEarned > 0"
                     [class.text-gray-400]="prediction.pointsEarned === null">
                  {{ prediction.pointsEarned !== null ? prediction.pointsEarned : '-' }}
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <button (click)="editPrediction(prediction)"
                      *ngIf="canEdit(prediction)"
                      class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
                Edit Prediction
              </button>
              <button (click)="viewMatch(prediction)"
                      class="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors">
                View Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyPredictionsComponent implements OnInit {
  private predictionService = inject(PredictionService);
  private router = inject(Router);

  predictions = signal<Prediction[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.loadPredictions();
  }

  loadPredictions(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.predictionService.getMyPredictions().subscribe({
      next: (predictions) => {
        this.predictions.set(predictions);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load predictions. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading predictions:', error);
      }
    });
  }

  canEdit(prediction: Prediction): boolean {
    // Can only edit if status is PENDING (not scored yet)
    return prediction.status === 'PENDING' || prediction.status === 'ACTIVE';
  }

  editPrediction(prediction: Prediction): void {
    this.router.navigate(['/predictions', 'new'], { queryParams: { matchId: prediction.matchId } });
  }

  viewMatch(prediction: Prediction): void {
    this.router.navigate(['/matches']);
  }

  goToMatches(): void {
    this.router.navigate(['/matches']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusBadgeClass(status: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';

    switch (status) {
      case 'PENDING':
      case 'ACTIVE':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'SCORED':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}
