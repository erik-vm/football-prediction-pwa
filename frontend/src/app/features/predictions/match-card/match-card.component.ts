import { Component, Input, computed, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Match } from '../../../core/models/match.model';
import { Prediction } from '../../../core/models/prediction.model';
import { StatusBadgeComponent, BadgeStatus } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <div class="bg-white rounded-xl shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
      <!-- Header: Date/Time and Status Badge -->
      <div class="flex justify-between items-start mb-4">
        <div class="text-sm text-gray-500">
          {{ formattedKickoffTime() }}
        </div>
        <app-status-badge [status]="badgeStatus()" />
      </div>

      <!-- Team Names and Score/VS -->
      <div class="flex items-center justify-between mb-4">
        <!-- Home Team -->
        <div class="flex-1 flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div class="text-sm font-medium text-gray-800 text-center">{{ match().homeTeam }}</div>
        </div>

        <!-- Score or VS -->
        <div class="px-4">
          @if (match().isFinished) {
            <div class="text-3xl font-bold text-gray-900">
              {{ match().homeScore }} - {{ match().awayScore }}
            </div>
          } @else {
            <div class="text-xl font-semibold text-gray-400">VS</div>
          }
        </div>

        <!-- Away Team -->
        <div class="flex-1 flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <div class="text-sm font-medium text-gray-800 text-center">{{ match().awayTeam }}</div>
        </div>
      </div>

      <!-- User Prediction Display -->
      @if (prediction() && match().isFinished && prediction()!.pointsEarned !== undefined) {
        <div class="bg-blue-50 rounded-lg p-3 mb-3">
          <div class="text-xs text-gray-600 mb-1">Your Prediction: {{ prediction()!.homeScore }}-{{ prediction()!.awayScore }}</div>
          <div class="text-sm font-semibold text-green-600">{{ prediction()!.pointsEarned }} points earned</div>
        </div>
      } @else if (prediction()) {
        <div class="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3 mb-3">
          <div class="text-sm font-semibold text-yellow-900">Your prediction: {{ prediction()!.homeScore }}-{{ prediction()!.awayScore }}</div>
        </div>
      }

      <!-- Action Button -->
      @if (!match().isFinished && !matchStarted()) {
        <a
          [routerLink]="['/predictions', match().id]"
          class="block w-full text-center px-4 py-3 bg-cyan-500 text-white font-bold rounded-full hover:bg-cyan-600 transition-colors"
        >
          {{ hasPrediction() ? 'Edit Prediction' : 'Make Prediction' }}
        </a>
      }
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

  badgeStatus = computed((): BadgeStatus => {
    const match = this.matchSignal();
    if (match.isFinished) return 'finished';
    if (this.matchStarted()) return 'live';
    return 'upcoming';
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
