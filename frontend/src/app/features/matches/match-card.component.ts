import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../shared/models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 cursor-pointer"
         (click)="onCardClick()">

      <!-- Status Badge -->
      <div class="flex justify-start items-center mb-3">
        <span [class]="getStatusBadgeClass()">
          {{ getStatusLabel() }}
        </span>
      </div>

      <!-- Match Details -->
      <div class="space-y-3">
        <!-- Teams and Score -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="font-semibold text-gray-900">{{ match.homeTeam }}</div>
          </div>
          <div class="flex items-center justify-center min-w-[60px] text-2xl font-bold text-gray-900">
            <span>{{ match.homeScore !== null ? match.homeScore : '-' }}</span>
            <span class="mx-2 text-gray-400">:</span>
            <span>{{ match.awayScore !== null ? match.awayScore : '-' }}</span>
          </div>
          <div class="flex-1 text-right">
            <div class="font-semibold text-gray-900">{{ match.awayTeam }}</div>
          </div>
        </div>

        <!-- Kickoff Time -->
        <div class="text-sm text-gray-600 text-center">
          <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {{ formatKickoffTime(match.kickoffTime) }}
        </div>

        <!-- Predict Button (only for upcoming matches) -->
        <div *ngIf="match.status === 'SCHEDULED' && !isPastDeadline(match.kickoffTime)"
             class="pt-2 border-t border-gray-200">
          <button (click)="onPredictClick($event)"
                  class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200">
            {{ hasPrediction() ? 'Edit Prediction' : 'Make Prediction' }}
          </button>
        </div>

        <!-- Deadline Passed Message -->
        <div *ngIf="match.status === 'SCHEDULED' && isPastDeadline(match.kickoffTime)"
             class="pt-2 border-t border-gray-200 text-center text-xs text-gray-500">
          Prediction deadline passed
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Output() predict = new EventEmitter<Match>();
  @Output() cardClick = new EventEmitter<Match>();

  getStatusBadgeClass(): string {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';

    switch (this.match.status) {
      case 'SCHEDULED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'IN_PLAY':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'FINISHED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  getStatusLabel(): string {
    switch (this.match.status) {
      case 'SCHEDULED':
        return 'UPCOMING';
      case 'IN_PLAY':
        return 'LIVE';
      case 'FINISHED':
        return 'FINISHED';
      default:
        return this.match.status || 'UNKNOWN';
    }
  }

  formatKickoffTime(kickoffTime: string): string {
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

  isPastDeadline(kickoffTime: string): boolean {
    return new Date(kickoffTime) <= new Date();
  }

  hasPrediction(): boolean {
    return false;
  }

  onPredictClick(event: Event): void {
    event.stopPropagation();
    this.predict.emit(this.match);
  }

  onCardClick(): void {
    this.cardClick.emit(this.match);
  }
}
