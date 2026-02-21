import { Component } from '@angular/core';
import { InstallPromptComponent } from '../../shared/components/install-prompt/install-prompt.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [InstallPromptComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <app-install-prompt />

      <div class="text-center">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Football Prediction Game
        </h2>
        <p class="text-xl text-gray-600 mb-8">
          Predict match scores, earn points, and compete on the leaderboard!
        </p>
        <div class="space-x-4">
          <button class="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Get Started
          </button>
          <button class="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold mb-2">🎯 Predict</h3>
          <p class="text-gray-600">Submit your predictions before matches start</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold mb-2">🏆 Compete</h3>
          <p class="text-gray-600">Earn points based on accuracy of your predictions</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold mb-2">📊 Leaderboard</h3>
          <p class="text-gray-600">Climb the rankings and win weekly bonuses</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {}
