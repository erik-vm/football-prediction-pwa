import { Component, Input, computed, signal } from '@angular/core';

export type BadgeStatus = 'upcoming' | 'live' | 'finished';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span [class]="badgeConfig().classes">
      {{ badgeConfig().label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() set status(value: string) { this._status.set(value); }
  private _status = signal<string>('');

  badgeConfig = computed(() => {
    const base = 'px-3 py-1 text-xs font-bold uppercase rounded-full';
    switch (this._status().toUpperCase()) {
      case 'SCHEDULED':
      case 'UPCOMING':
        return { label: 'UPCOMING', classes: `${base} bg-orange-500 text-white` };
      case 'IN_PLAY':
      case 'LIVE':
        return { label: 'LIVE', classes: `${base} bg-red-500 text-white` };
      case 'FINISHED':
      case 'COMPLETED':
        return { label: 'FINISHED', classes: `${base} bg-gray-500 text-white` };
      default:
        return { label: this._status(), classes: `${base} bg-gray-500 text-white` };
    }
  });
}
