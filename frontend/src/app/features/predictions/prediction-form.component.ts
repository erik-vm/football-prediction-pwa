import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PredictionService } from './services/prediction.service';
import { MatchService } from '../matches/services/match.service';
import { Match } from '../../shared/models/match.model';
import { Prediction } from '../../shared/models/prediction.model';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl mx-auto">
        <!-- Back Button -->
        <button (click)="goBack()" class="mb-4 text-blue-600 hover:text-blue-800 flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Matches
        </button>

        <!-- Loading State -->
        <div *ngIf="isLoadingMatch()" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Main Content -->
        <div *ngIf="!isLoadingMatch() && match()" class="bg-white rounded-lg shadow-md p-6">
          <!-- Header -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ isEditing() ? 'Edit Prediction' : 'Make Prediction' }}
            </h1>
            <p class="mt-1 text-sm text-gray-600">
              Submit your score prediction before kickoff
            </p>
          </div>

          <!-- Match Info -->
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div class="flex-1 text-center">
                <div class="font-semibold text-lg text-gray-900">{{ match()?.homeTeam }}</div>
              </div>
              <div class="px-4 text-gray-400">vs</div>
              <div class="flex-1 text-center">
                <div class="font-semibold text-lg text-gray-900">{{ match()?.awayTeam }}</div>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-600 text-center">
              <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {{ formatKickoffTime(match()?.kickoffTime) }}
            </div>
          </div>

          <!-- Deadline Passed Warning -->
          <div *ngIf="isPastDeadline()" class="mb-6 rounded-md bg-yellow-50 p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm font-medium text-yellow-800">
                  Match has started. Predictions are locked.
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="mb-6 rounded-md bg-red-50 p-4">
            <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage()" class="mb-6 rounded-md bg-green-50 p-4">
            <p class="text-sm font-medium text-green-800">{{ successMessage() }}</p>
          </div>

          <!-- Prediction Form -->
          <form [formGroup]="predictionForm" (ngSubmit)="onSubmit()" *ngIf="!isPastDeadline()">
            <div class="space-y-6">
              <!-- Score Inputs -->
              <div class="grid grid-cols-3 gap-4 items-center">
                <!-- Home Score -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {{ match()?.homeTeam }} Score
                  </label>
                  <input
                    type="number"
                    formControlName="homeScore"
                    min="0"
                    max="9"
                    class="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-500]="predictionForm.get('homeScore')?.invalid && predictionForm.get('homeScore')?.touched"
                  />
                  <div *ngIf="predictionForm.get('homeScore')?.invalid && predictionForm.get('homeScore')?.touched" class="mt-1">
                    <p class="text-xs text-red-600">Score must be 0-9</p>
                  </div>
                </div>

                <!-- Separator -->
                <div class="text-center text-2xl font-bold text-gray-400">:</div>

                <!-- Away Score -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
                    {{ match()?.awayTeam }} Score
                  </label>
                  <input
                    type="number"
                    formControlName="awayScore"
                    min="0"
                    max="9"
                    class="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    [class.border-red-500]="predictionForm.get('awayScore')?.invalid && predictionForm.get('awayScore')?.touched"
                  />
                  <div *ngIf="predictionForm.get('awayScore')?.invalid && predictionForm.get('awayScore')?.touched" class="mt-1">
                    <p class="text-xs text-red-600">Score must be 0-9</p>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-4">
                <button
                  type="submit"
                  [disabled]="predictionForm.invalid || isSubmitting()"
                  class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <svg *ngIf="isSubmitting()" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isSubmitting() ? 'Submitting...' : (isEditing() ? 'Update Prediction' : 'Submit Prediction') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      opacity: 1;
    }
  `]
})
export class PredictionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private predictionService = inject(PredictionService);
  private matchService = inject(MatchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  match = signal<Match | null>(null);
  existingPrediction = signal<Prediction | null>(null);
  isLoadingMatch = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isEditing = signal<boolean>(false);

  predictionForm = this.fb.nonNullable.group({
    homeScore: [0, [Validators.required, Validators.min(0), Validators.max(9)]],
    awayScore: [0, [Validators.required, Validators.min(0), Validators.max(9)]]
  });

  ngOnInit(): void {
    const matchId = this.route.snapshot.queryParamMap.get('matchId');
    if (matchId) {
      this.loadMatch(matchId);
    } else {
      this.errorMessage.set('No match selected');
    }
  }

  loadMatch(matchId: string): void {
    this.isLoadingMatch.set(true);
    this.matchService.getById(matchId).subscribe({
      next: (match) => {
        this.match.set(match);
        this.isLoadingMatch.set(false);
        this.loadExistingPrediction(matchId);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load match details');
        this.isLoadingMatch.set(false);
        console.error('Error loading match:', error);
      }
    });
  }

  loadExistingPrediction(matchId: string): void {
    this.predictionService.getByMatchId(matchId).subscribe({
      next: (prediction) => {
        this.existingPrediction.set(prediction);
        this.isEditing.set(true);
        this.predictionForm.patchValue({
          homeScore: prediction.homeScore,
          awayScore: prediction.awayScore
        });
      },
      error: () => {
        // No existing prediction, that's fine
      }
    });
  }

  onSubmit(): void {
    if (this.predictionForm.invalid || this.isPastDeadline()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      matchId: this.match()!.id,
      homeScore: this.predictionForm.value.homeScore!,
      awayScore: this.predictionForm.value.awayScore!
    };

    const operation = this.isEditing()
      ? this.predictionService.update(this.existingPrediction()!.id, request)
      : this.predictionService.create(request);

    operation.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Prediction ${this.isEditing() ? 'updated' : 'submitted'} successfully!`);
        setTimeout(() => {
          this.router.navigate(['/matches']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message || `Failed to ${this.isEditing() ? 'update' : 'submit'} prediction`);
      }
    });
  }

  isPastDeadline(): boolean {
    const kickoffTime = this.match()?.kickoffTime;
    if (!kickoffTime) return false;
    return new Date(kickoffTime) <= new Date();
  }

  formatKickoffTime(kickoffTime: string | undefined): string {
    if (!kickoffTime) return '';
    const date = new Date(kickoffTime);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  }

  goBack(): void {
    this.router.navigate(['/matches']);
  }
}
