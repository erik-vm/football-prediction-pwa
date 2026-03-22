import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';

@Component({
  selector: 'app-score-input',
  standalone: true,
  template: `
    <div class="flex flex-col items-center">
      <span class="text-sm text-gray-600 mb-2 truncate max-w-[120px] text-center">{{ teamName }}</span>
      <div class="bg-cyan-400 rounded-xl flex flex-col items-center justify-between py-4 px-8 h-44 w-32">
        <button
          type="button"
          (click)="increment()"
          [disabled]="score() >= maxScore"
          class="text-white text-2xl font-bold w-8 h-8 flex items-center justify-center disabled:opacity-30">
          +
        </button>
        <span class="text-white text-5xl font-bold">{{ score() }}</span>
        <button
          type="button"
          (click)="decrement()"
          [disabled]="score() <= minScore"
          class="text-white text-2xl font-bold w-8 h-8 flex items-center justify-center disabled:opacity-30">
          -
        </button>
      </div>
    </div>
  `
})
export class ScoreInputComponent {
  @Input() teamName = '';
  @Input() minScore = 0;
  @Input() maxScore = 20;
  @Input() set value(v: number) { this.score.set(v); }
  @Output() valueChange = new EventEmitter<number>();

  score = signal(0);

  increment(): void {
    if (this.score() < this.maxScore) {
      this.score.update(v => v + 1);
      this.valueChange.emit(this.score());
    }
  }

  decrement(): void {
    if (this.score() > this.minScore) {
      this.score.update(v => v - 1);
      this.valueChange.emit(this.score());
    }
  }
}
