import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeStatus = 'upcoming' | 'live' | 'finished';

@Component({
  selector: 'app-status-badge',
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  status = input.required<BadgeStatus>();

  badgeConfig = computed(() => {
    const status = this.status();
    switch (status) {
      case 'upcoming':
        return {
          label: 'UPCOMING',
          classes: 'bg-orange-500 text-white'
        };
      case 'live':
        return {
          label: 'LIVE',
          classes: 'bg-red-500 text-white'
        };
      case 'finished':
        return {
          label: 'FINISHED',
          classes: 'bg-gray-500 text-white'
        };
    }
  });
}
