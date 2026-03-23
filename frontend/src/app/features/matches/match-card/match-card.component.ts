import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatchDto } from '../../../shared/models/match.model';
import { PredictionDto } from '../../../shared/models/prediction.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './match-card.component.html'
})
export class MatchCardComponent {
  match = input.required<MatchDto>();
  prediction = input<PredictionDto | null>(null);
  predict = output<MatchDto>();

  getStatusBadgeClass(): string {
    const status = this.match().status;
    if (status === 'FINISHED') return 'bg-gray-200 text-gray-700';
    if (status === 'IN_PLAY' || status === 'LIVE') return 'bg-red-100 text-red-600';
    return 'bg-cyan-100 text-cyan-700';
  }

  getStatusLabel(): string {
    const status = this.match().status;
    if (status === 'FINISHED') return 'Finished';
    if (status === 'IN_PLAY' || status === 'LIVE') return 'Live';
    return 'Upcoming';
  }

  hasPrediction(): boolean {
    return this.prediction() !== null;
  }

  onPredict(): void {
    this.predict.emit(this.match());
  }
}
