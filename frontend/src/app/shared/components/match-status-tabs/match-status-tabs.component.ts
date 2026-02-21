import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface MatchStatusTab {
  status: MatchStatus;
  label: string;
  count: number;
}

@Component({
  selector: 'app-match-status-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-status-tabs.component.html',
  styleUrl: './match-status-tabs.component.css'
})
export class MatchStatusTabsComponent {
  tabs = input.required<MatchStatusTab[]>();
  activeTab = input.required<MatchStatus>();

  tabSelected = output<MatchStatus>();

  onTabClick(status: MatchStatus): void {
    this.tabSelected.emit(status);
  }
}
