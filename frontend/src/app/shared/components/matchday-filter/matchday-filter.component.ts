import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matchday-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matchday-filter.component.html',
  styleUrl: './matchday-filter.component.css'
})
export class MatchdayFilterComponent {
  matchdays = input.required<number[]>();
  selectedMatchday = input<number | null>(null);

  matchdaySelected = output<number | null>();

  protected currentSelection = signal<number | null>(null);

  ngOnInit(): void {
    this.currentSelection.set(this.selectedMatchday());
  }

  onMatchdayChange(value: string): void {
    const matchday = value === '' ? null : parseInt(value, 10);
    this.currentSelection.set(matchday);
    this.matchdaySelected.emit(matchday);
  }
}
