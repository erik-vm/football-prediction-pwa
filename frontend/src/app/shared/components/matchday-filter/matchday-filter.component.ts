import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-matchday-filter',
  standalone: true,
  template: `
    <div class="mb-3">
      <select
        [value]="selected ?? ''"
        (change)="onSelectionChange($event)"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option value="">All Matchdays</option>
        @for (day of matchdays; track day) {
          <option [value]="day">Matchday {{ day }}</option>
        }
      </select>
    </div>
  `
})
export class MatchdayFilterComponent {
  @Input() matchdays: number[] = [];
  @Input() selected: number | null = null;
  @Output() selectionChange = new EventEmitter<number | null>();

  onSelectionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectionChange.emit(value ? Number(value) : null);
  }
}
