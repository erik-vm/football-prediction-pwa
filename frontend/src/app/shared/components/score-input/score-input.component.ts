import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-score-input',
  imports: [CommonModule, FormsModule],
  templateUrl: './score-input.component.html',
  styleUrl: './score-input.component.scss'
})
export class ScoreInputComponent {
  @Input() teamName: string = '';
  @Input() set score(value: number | null | undefined) {
    if (value !== null && value !== undefined) {
      this.scoreSignal.set(Number(value));
    }
  }
  @Input() minScore: number = 0;
  @Input() maxScore: number = 20;

  @Output() scoreChange = new EventEmitter<number>();

  scoreSignal = signal<number>(0);

  increment(): void {
    const currentScore = Number(this.scoreSignal());
    if (currentScore < this.maxScore) {
      const newScore = currentScore + 1;
      this.scoreSignal.set(newScore);
      this.scoreChange.emit(newScore);
    }
  }

  decrement(): void {
    const currentScore = Number(this.scoreSignal());
    if (currentScore > this.minScore) {
      const newScore = currentScore - 1;
      this.scoreSignal.set(newScore);
      this.scoreChange.emit(newScore);
    }
  }

  onScoreChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    if (isNaN(value)) {
      value = 0;
    }

    if (value < this.minScore) {
      value = this.minScore;
    }

    if (value > this.maxScore) {
      value = this.maxScore;
    }

    this.scoreSignal.set(value);
    this.scoreChange.emit(value);
  }
}
