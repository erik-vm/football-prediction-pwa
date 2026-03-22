import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PredictionService } from './services/prediction.service';
import { MatchService } from '../matches/services/match.service';
import { AuthService } from '../../core/services/auth.service';
import { ScoreInputComponent } from '../../shared/components/score-input/score-input.component';
import { PointsInfoComponent } from '../../shared/components/points-info/points-info.component';
import { Match } from '../../shared/models/match.model';
import { Prediction } from '../../shared/models/prediction.model';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  imports: [ScoreInputComponent, PointsInfoComponent],
  template: `
    <div class="bg-gray-100 px-4 pt-4 pb-8">
      <div class="max-w-lg mx-auto">
        <button (click)="goBack()" class="mb-4 text-cyan-500 hover:text-cyan-600 flex items-center text-sm font-medium">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Matches
        </button>

        @if (isLoadingMatch()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        }

        @if (!isLoadingMatch() && match()) {
          <!-- Match Info -->
          <div class="bg-gray-200 rounded-xl p-4 mb-4 text-center">
            <span class="text-sm font-semibold text-gray-700">
              {{ match()!.homeTeam }} vs {{ match()!.awayTeam }}
            </span>
          </div>

          <!-- Deadline Info -->
          @if (!isPastDeadline()) {
            <div class="bg-cyan-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <svg class="w-6 h-6 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <div class="font-bold text-cyan-700">Deadline</div>
                <div class="text-sm text-cyan-600">{{ formatKickoffTime(match()!.kickoffTime) }}</div>
              </div>
            </div>
          }

          @if (isPastDeadline()) {
            <div class="bg-yellow-50 rounded-xl p-4 mb-6">
              <p class="text-sm font-medium text-yellow-800">Match has started. Predictions are locked.</p>
            </div>
          }

          @if (errorMessage()) {
            <div class="rounded-xl bg-red-50 p-4 mb-4">
              <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
            </div>
          }

          @if (successMessage()) {
            <div class="rounded-xl bg-green-50 p-4 mb-4">
              <p class="text-sm font-medium text-green-800">{{ successMessage() }}</p>
            </div>
          }

          @if (!isPastDeadline()) {
            <!-- Score Inputs -->
            <h2 class="text-lg font-semibold text-gray-800 mb-4 text-center">Predict the Score</h2>
            <div class="flex items-center justify-center gap-4 mb-6">
              <app-score-input
                [teamName]="match()!.homeTeam"
                [value]="homeScore()"
                (valueChange)="homeScore.set($event)" />
              <span class="text-gray-400 font-medium text-lg mt-6">VS</span>
              <app-score-input
                [teamName]="match()!.awayTeam"
                [value]="awayScore()"
                (valueChange)="awayScore.set($event)" />
            </div>

            <!-- Points Info -->
            <div class="mb-6">
              <app-points-info />
            </div>

            <!-- Submit -->
            <button
              (click)="onSubmit()"
              [disabled]="isSubmitting()"
              class="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              @if (isSubmitting()) {
                <svg class="animate-spin inline -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              } @else {
                {{ isEditing() ? 'Update Prediction' : 'Save Prediction' }}
              }
            </button>
          }
        }

        @if (!isLoadingMatch() && !match() && errorMessage()) {
          <div class="rounded-xl bg-red-50 p-4">
            <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class PredictionFormComponent implements OnInit {
  private predictionService = inject(PredictionService);
  private matchService = inject(MatchService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  match = signal<Match | null>(null);
  existingPrediction = signal<Prediction | null>(null);
  isLoadingMatch = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isEditing = signal(false);
  homeScore = signal(0);
  awayScore = signal(0);

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
      error: () => {
        this.errorMessage.set('Failed to load match details');
        this.isLoadingMatch.set(false);
      }
    });
  }

  loadExistingPrediction(matchId: string): void {
    this.predictionService.getByMatchId(matchId).subscribe({
      next: (prediction) => {
        if (prediction) {
          this.existingPrediction.set(prediction);
          this.isEditing.set(true);
          this.homeScore.set(prediction.homeScore);
          this.awayScore.set(prediction.awayScore);
        }
      },
      error: () => {}
    });
  }

  onSubmit(): void {
    if (this.isPastDeadline()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const user = this.authService.currentUser();
    const request = {
      userId: user?.userId,
      matchId: this.match()!.id,
      homeScore: this.homeScore(),
      awayScore: this.awayScore()
    };

    const operation = this.isEditing()
      ? this.predictionService.update(this.existingPrediction()!.id, request)
      : this.predictionService.create(request);

    operation.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set(`Prediction ${this.isEditing() ? 'updated' : 'submitted'} successfully!`);
        setTimeout(() => this.router.navigate(['/matches']), 1500);
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

  formatKickoffTime(kickoffTime: string): string {
    const date = new Date(kickoffTime);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  goBack(): void {
    this.router.navigate(['/matches']);
  }
}
