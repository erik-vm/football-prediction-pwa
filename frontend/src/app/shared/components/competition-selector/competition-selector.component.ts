import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-competition-selector',
  standalone: true,
  template: `
    <div class="mb-3">
      <label class="block text-xs text-gray-500 mb-1">Competition</label>
      <select
        [value]="selected"
        (change)="onSelectionChange($event)"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500">
        <option value="">All Competitions</option>
        @for (code of competitions; track code) {
          <option [value]="code">{{ code }}</option>
        }
      </select>
    </div>
  `
})
export class CompetitionSelectorComponent {
  @Input() competitions: string[] = [];
  @Input() selected = '';
  @Output() selectionChange = new EventEmitter<string>();

  onSelectionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectionChange.emit(value);
  }
}
