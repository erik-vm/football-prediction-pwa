import { Component } from '@angular/core';

@Component({
  selector: 'app-points-info',
  standalone: true,
  template: `
    <div class="bg-gray-50 rounded-xl p-5">
      <div class="flex items-center gap-2 mb-3">
        <svg class="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="font-bold text-gray-800">Points Breakdown</span>
      </div>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600">Exact score prediction</span>
          <span class="font-semibold text-cyan-500">+5 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Correct winner</span>
          <span class="font-semibold text-cyan-500">+3 pts</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Correct goal difference</span>
          <span class="font-semibold text-cyan-500">+2 pts</span>
        </div>
      </div>
    </div>
  `
})
export class PointsInfoComponent {}
