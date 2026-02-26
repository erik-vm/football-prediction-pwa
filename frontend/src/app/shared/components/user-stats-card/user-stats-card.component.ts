import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserStatsCardData {
  rank: number;
  points: number;
  predictions: number;
  accuracy: number;
}

@Component({
  selector: 'app-user-stats-card',
  imports: [CommonModule],
  templateUrl: './user-stats-card.component.html',
  styleUrl: './user-stats-card.component.scss'
})
export class UserStatsCardComponent {
  @Input() set stats(value: UserStatsCardData | null) {
    if (value) {
      this.statsSignal.set(value);
    }
  }

  private statsSignal = signal<UserStatsCardData>({
    rank: 0,
    points: 0,
    predictions: 0,
    accuracy: 0
  });

  displayStats = this.statsSignal.asReadonly();

  formattedAccuracy = computed(() => {
    const accuracy = this.statsSignal().accuracy;
    return accuracy.toFixed(1);
  });
}
