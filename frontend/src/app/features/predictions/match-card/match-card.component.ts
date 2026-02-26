import { Component, Input, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Match } from '../../../core/models/match.model';
import { Prediction } from '../../../core/models/prediction.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div class="flex justify-between items-start mb-3">
        <div class="text-xs font-medium text-gray-500 uppercase">
          {{ stageName() }} · x{{ match().stageMultiplier }}
        </div>
        @if (hasPrediction()) {
          <div class="flex items-center gap-1 text-green-600 text-xs font-medium">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Predicted
          </div>
        }
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex-1 text-right pr-4">
            <div class="text-lg font-semibold text-gray-900">{{ match().homeTeam }}</div>
          </div>

          <div class="flex items-center gap-2 text-center min-w-[80px]">
            @if (match().isFinished) {
              <div class="text-2xl font-bold text-gray-900">
                {{ match().homeScore }} - {{ match().awayScore }}
              </div>
            } @else {
              <div class="text-xl font-medium text-gray-400">VS</div>
            }
          </div>

          <div class="flex-1 pl-4">
            <div class="text-lg font-semibold text-gray-900">{{ match().awayTeam }}</div>
          </div>
        </div>

        @if (prediction() && match().isFinished && prediction()!.pointsEarned !== undefined) {
          <div class="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-center">
            <div class="text-xs text-blue-600 font-medium">Your Prediction</div>
            <div class="text-sm font-semibold text-blue-900">
              {{ prediction()!.homeScore }} - {{ prediction()!.awayScore }}
              <span class="ml-2 text-blue-600">· {{ prediction()!.pointsEarned }} pts</span>
            </div>
          </div>
        } @else if (prediction()) {
          <div class="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-center">
            <div class="text-xs text-gray-600 font-medium">Your Prediction</div>
            <div class="text-sm font-semibold text-gray-900">
              {{ prediction()!.homeScore }} - {{ prediction()!.awayScore }}
            </div>
          </div>
        }

        <div class="flex items-center justify-between text-sm pt-2 border-t border-gray-100">
          <div class="text-gray-600">
            {{ formattedKickoffTime() }}
          </div>

          @if (match().isFinished) {
            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              Finished
            </span>
          } @else if (matchStarted()) {
            <span class="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
              In Progress
            </span>
          } @else {
            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              {{ countdown() }}
            </span>
          }
        </div>

        @if (!match().isFinished && !matchStarted()) {
          <a
            [routerLink]="['/predictions', match().id]"
            class="block w-full text-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors"
          >
            {{ hasPrediction() ? 'Edit Prediction' : 'Make Prediction' }}
          </a>
        }
      </div>
    </div>
  `,
  styles: []
})
export class MatchCardComponent {
  @Input({ required: true }) set matchData(value: Match) {
    this.matchSignal.set(value);
  }
  @Input() set predictionData(value: Prediction | null | undefined) {
    this.predictionSignal.set(value || null);
  }

  private matchSignal = signal<Match>({} as Match);
  private predictionSignal = signal<Prediction | null>(null);
  private currentTimeSignal = signal<number>(Date.now());

  match = this.matchSignal.asReadonly();
  prediction = this.predictionSignal.asReadonly();

  hasPrediction = computed(() => this.predictionSignal() !== null);

  matchStarted = computed(() => {
    const kickoff = new Date(this.matchSignal().kickoffTime).getTime();
    return this.currentTimeSignal() >= kickoff;
  });

  stageName = computed(() => {
    const stage = this.matchSignal().stage;
    return stage?.replace(/_/g, ' ') || '';
  });

  formattedKickoffTime = computed(() => {
    const date = new Date(this.matchSignal().kickoffTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  countdown = computed(() => {
    const kickoff = new Date(this.matchSignal().kickoffTime).getTime();
    const now = this.currentTimeSignal();
    const diff = kickoff - now;

    if (diff <= 0) return 'Starting soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  });

  private intervalId?: number;

  constructor() {
    effect(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      if (!this.matchSignal().isFinished) {
        this.intervalId = window.setInterval(() => {
          this.currentTimeSignal.set(Date.now());
        }, 60000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
