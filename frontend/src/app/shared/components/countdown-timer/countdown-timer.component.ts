import { Component, Input, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="countdown-timer" [class.urgent]="isUrgent()">
      <span class="timer-text">{{ formattedTime() }}</span>
    </div>
  `,
  styles: [`
    .countdown-timer {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      background-color: #f3f4f6;
      color: #374151;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .countdown-timer.urgent {
      background-color: #fef2f2;
      color: #dc2626;
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .timer-text {
      font-variant-numeric: tabular-nums;
    }
  `]
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  @Input() match!: Match;

  private currentTimeSignal = signal<Date>(new Date());
  private intervalId: any = null;

  timeRemaining = computed(() => {
    const now = this.currentTimeSignal();
    const kickoff = new Date(this.match.kickoffTime);
    const diff = kickoff.getTime() - now.getTime();
    return diff > 0 ? diff : 0;
  });

  isUrgent = computed(() => {
    const remaining = this.timeRemaining();
    return remaining > 0 && remaining < 60 * 60 * 1000;
  });

  formattedTime = computed(() => {
    const remaining = this.timeRemaining();

    if (remaining === 0) {
      return 'Started';
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} minutes`;
    }
  });

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentTimeSignal.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
