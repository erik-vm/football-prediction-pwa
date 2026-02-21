import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { Match } from '../../../core/models/match.model';
import { Prediction } from '../../../core/models/prediction.model';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto px-4 py-8">
      @if (isLoading()) {
        <div class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p class="mt-4 text-gray-600">Loading match...</p>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p class="text-red-800">{{ error() }}</p>
        </div>
        <a
          routerLink="/predictions"
          class="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Predictions
        </a>
      } @else if (match()) {
        <div class="mb-6">
          <a
            routerLink="/predictions"
            class="inline-flex items-center text-sm text-gray-600 hover:text-primary-600"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to all matches
          </a>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="mb-6">
            <div class="text-xs font-medium text-gray-500 uppercase mb-4">
              {{ stageName() }} · Multiplier: x{{ match()!.stageMultiplier }}
            </div>

            <div class="flex items-center justify-between mb-4">
              <div class="flex-1 text-right pr-6">
                <h2 class="text-2xl font-bold text-gray-900">{{ match()!.homeTeam }}</h2>
              </div>
              <div class="text-3xl font-bold text-gray-400">VS</div>
              <div class="flex-1 pl-6">
                <h2 class="text-2xl font-bold text-gray-900">{{ match()!.awayTeam }}</h2>
              </div>
            </div>

            <div class="text-center text-sm text-gray-600">
              {{ formattedKickoffTime() }}
            </div>
          </div>

          @if (matchStarted()) {
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p class="text-yellow-800 font-medium">This match has already started</p>
              <p class="text-yellow-600 text-sm mt-1">Predictions are no longer accepted</p>
            </div>
          } @else {
            <form [formGroup]="predictionForm" (ngSubmit)="onSubmit()">
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">
                    {{ existingPrediction() ? 'Update Your Prediction' : 'Make Your Prediction' }}
                  </h3>

                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ match()!.homeTeam }} Score
                      </label>
                      <input
                        type="number"
                        formControlName="homeScore"
                        min="0"
                        max="20"
                        class="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        [class.border-red-500]="homeScore?.invalid && homeScore?.touched"
                      />
                      @if (homeScore?.invalid && homeScore?.touched) {
                        <p class="mt-1 text-sm text-red-600">
                          @if (homeScore?.errors?.['required']) {
                            Score is required
                          } @else if (homeScore?.errors?.['min']) {
                            Minimum score is 0
                          } @else if (homeScore?.errors?.['max']) {
                            Maximum score is 20
                          }
                        </p>
                      }
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        {{ match()!.awayTeam }} Score
                      </label>
                      <input
                        type="number"
                        formControlName="awayScore"
                        min="0"
                        max="20"
                        class="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        [class.border-red-500]="awayScore?.invalid && awayScore?.touched"
                      />
                      @if (awayScore?.invalid && awayScore?.touched) {
                        <p class="mt-1 text-sm text-red-600">
                          @if (awayScore?.errors?.['required']) {
                            Score is required
                          } @else if (awayScore?.errors?.['min']) {
                            Minimum score is 0
                          } @else if (awayScore?.errors?.['max']) {
                            Maximum score is 20
                          }
                        </p>
                      }
                    </div>
                  </div>
                </div>

                @if (predictionError()) {
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-red-800 text-sm">{{ predictionError() }}</p>
                  </div>
                }

                @if (successMessage()) {
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p class="text-green-800 text-sm">{{ successMessage() }}</p>
                  </div>
                }

                <div class="flex gap-4">
                  <button
                    type="submit"
                    [disabled]="predictionForm.invalid || isSubmitting()"
                    class="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    @if (isSubmitting()) {
                      <span class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    } @else {
                      {{ existingPrediction() ? 'Update Prediction' : 'Submit Prediction' }}
                    }
                  </button>

                  <a
                    routerLink="/predictions"
                    class="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </a>
                </div>
              </div>
            </form>
          }
        </div>
      }
    </div>
  `,
  styles: []
})
export class PredictionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private matchService = inject(MatchService);
  private predictionService = inject(PredictionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  predictionForm!: FormGroup;

  private matchSignal = signal<Match | null>(null);
  private existingPredictionSignal = signal<Prediction | null>(null);
  private isLoadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);
  private isSubmittingSignal = signal<boolean>(false);
  private successMessageSignal = signal<string | null>(null);

  match = this.matchSignal.asReadonly();
  existingPrediction = this.existingPredictionSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  isSubmitting = this.isSubmittingSignal.asReadonly();
  successMessage = this.successMessageSignal.asReadonly();
  predictionError = this.predictionService.error;

  matchStarted = computed(() => {
    const match = this.matchSignal();
    if (!match) return false;
    return new Date(match.kickoffTime).getTime() <= Date.now();
  });

  stageName = computed(() => {
    const match = this.matchSignal();
    if (!match) return '';
    return match.stage?.replace(/_/g, ' ') || '';
  });

  formattedKickoffTime = computed(() => {
    const match = this.matchSignal();
    if (!match) return '';
    const date = new Date(match.kickoffTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  ngOnInit(): void {
    this.predictionForm = this.fb.group({
      homeScore: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      awayScore: ['', [Validators.required, Validators.min(0), Validators.max(20)]]
    });

    const matchId = this.route.snapshot.paramMap.get('matchId');
    if (!matchId) {
      this.errorSignal.set('Match ID not provided');
      this.isLoadingSignal.set(false);
      return;
    }

    this.loadMatchData(matchId);
  }

  private loadMatchData(matchId: string): void {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    this.matchService.getMatch(matchId).subscribe({
      next: (response) => {
        if (response.data) {
          this.matchSignal.set(response.data);
          this.loadExistingPrediction(matchId);
        } else {
          this.errorSignal.set('Match not found');
          this.isLoadingSignal.set(false);
        }
      },
      error: (error) => {
        this.errorSignal.set(error.error?.message || 'Failed to load match');
        this.isLoadingSignal.set(false);
      }
    });
  }

  private loadExistingPrediction(matchId: string): void {
    this.predictionService.getPredictionByMatch(matchId).subscribe({
      next: (response) => {
        if (response.data) {
          this.existingPredictionSignal.set(response.data);
          this.predictionForm.patchValue({
            homeScore: response.data.predictedHomeScore,
            awayScore: response.data.predictedAwayScore
          });
        }
        this.isLoadingSignal.set(false);
      },
      error: () => {
        this.isLoadingSignal.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.predictionForm.invalid || this.matchStarted()) {
      this.predictionForm.markAllAsTouched();
      return;
    }

    this.isSubmittingSignal.set(true);
    this.successMessageSignal.set(null);
    this.predictionService.clearError();

    const match = this.matchSignal();
    if (!match) return;

    const request = {
      matchId: match.id,
      predictedHomeScore: this.predictionForm.value.homeScore,
      predictedAwayScore: this.predictionForm.value.awayScore
    };

    const existingPrediction = this.existingPredictionSignal();
    const apiCall = existingPrediction
      ? this.predictionService.updatePrediction(existingPrediction.id, request)
      : this.predictionService.submitPrediction(request);

    apiCall.subscribe({
      next: (response) => {
        this.isSubmittingSignal.set(false);
        if (response.data) {
          this.existingPredictionSignal.set(response.data);
          this.successMessageSignal.set(
            existingPrediction ? 'Prediction updated successfully!' : 'Prediction submitted successfully!'
          );
          setTimeout(() => {
            this.router.navigate(['/predictions']);
          }, 1500);
        }
      },
      error: () => {
        this.isSubmittingSignal.set(false);
      }
    });
  }

  get homeScore() {
    return this.predictionForm.get('homeScore');
  }

  get awayScore() {
    return this.predictionForm.get('awayScore');
  }
}
