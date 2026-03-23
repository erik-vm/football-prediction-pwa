import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatchDto } from '../../../shared/models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './match-card.component.html'
})
export class MatchCardComponent {
  match = input.required<MatchDto>();
  predict = output<MatchDto>();

  getStatusBadgeClass(): string {
    const status = this.match().status;
    if (status === 'FINISHED') return 'bg-gray-200 text-gray-700';
    if (status === 'IN_PLAY' || status === 'LIVE') return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  }

  getStatusLabel(): string {
    const status = this.match().status;
    if (status === 'FINISHED') return 'Completed';
    if (status === 'IN_PLAY' || status === 'LIVE') return 'Live';
    return 'Upcoming';
  }

  onPredict(): void {
    this.predict.emit(this.match());
  }
}
