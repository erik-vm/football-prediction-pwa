import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Match } from '../../shared/models/match.model';
import { Prediction } from '../../shared/models/prediction.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [StatusBadgeComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-md p-4 cursor-pointer" (click)="onCardClick()">
      <div class="flex justify-between items-center mb-3">
        <span class="text-sm text-gray-500">{{ formatKickoffTime(match.kickoffTime) }}</span>
        <app-status-badge [status]="match.status" />
      </div>

      <div class="flex items-center justify-between py-2">
        <div class="flex-1 text-center">
          <div class="w-10 h-10 mx-auto mb-1 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-sm font-semibold text-gray-900">{{ match.homeTeam }}</div>
        </div>

        <div class="px-4 text-center">
          @if (match.status === 'FINISHED' || match.status === 'IN_PLAY') {
            <span class="text-2xl font-bold text-gray-900">
              {{ match.homeScore }} - {{ match.awayScore }}
            </span>
          } @else {
            <span class="text-lg text-gray-400 font-medium">VS</span>
          }
        </div>

        <div class="flex-1 text-center">
          <div class="w-10 h-10 mx-auto mb-1 bg-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="text-sm font-semibold text-gray-900">{{ match.awayTeam }}</div>
        </div>
      </div>

      @if (prediction) {
        <div class="flex items-center gap-2 px-3 py-2 bg-cyan-50 rounded-lg text-sm text-cyan-700">
          <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span>Your prediction: {{ prediction.homeScore }} - {{ prediction.awayScore }}</span>
          @if (prediction.pointsEarned !== null && prediction.pointsEarned !== undefined) {
            <span class="ml-auto font-bold text-cyan-600">+{{ prediction.pointsEarned }} pts</span>
          }
        </div>
      }

      @if (match.status === 'SCHEDULED' && !isPastDeadline(match.kickoffTime)) {
        <div class="pt-3 border-t border-gray-100">
          <button (click)="onPredictClick($event)"
                  class="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full transition-colors">
            {{ prediction ? 'Edit Prediction' : 'Make Prediction' }}
          </button>
        </div>
      }

      @if (match.status === 'SCHEDULED' && isPastDeadline(match.kickoffTime) && !prediction) {
        <div class="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
          Prediction deadline passed
        </div>
      }
    </div>
  `
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Input() prediction?: Prediction;
  @Output() predict = new EventEmitter<Match>();
  @Output() cardClick = new EventEmitter<Match>();

  formatKickoffTime(kickoffTime: string): string {
    const date = new Date(kickoffTime);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  isPastDeadline(kickoffTime: string): boolean {
    return new Date(kickoffTime) <= new Date();
  }

  onPredictClick(event: Event): void {
    event.stopPropagation();
    this.predict.emit(this.match);
  }

  onCardClick(): void {
    this.cardClick.emit(this.match);
  }
}
