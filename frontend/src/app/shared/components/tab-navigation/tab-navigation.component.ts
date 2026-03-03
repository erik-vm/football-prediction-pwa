import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabType = 'upcoming' | 'live' | 'completed';

@Component({
  selector: 'app-tab-navigation',
  imports: [CommonModule],
  templateUrl: './tab-navigation.component.html',
  styleUrl: './tab-navigation.component.scss'
})
export class TabNavigationComponent {
  activeTab = input<TabType>('upcoming');
  tabChange = output<TabType>();

  tabs: { value: TabType; label: string }[] = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'live', label: 'Live' },
    { value: 'completed', label: 'Completed' }
  ];

  selectTab(tab: TabType): void {
    this.tabChange.emit(tab);
  }
}
