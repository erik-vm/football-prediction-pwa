import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  template: `
    <div class="bg-gray-100 px-4 pt-4 pb-8">
      <div class="max-w-lg mx-auto">
        <h1 class="text-xl font-bold text-gray-900 mb-4">Settings</h1>

        <!-- User Info -->
        <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Account</h2>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Username</span>
              <span class="font-medium text-gray-900">{{ user()?.username }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Email</span>
              <span class="font-medium text-gray-900">{{ user()?.email }}</span>
            </div>
          </div>
        </div>

        <!-- Competition Preferences (placeholder) -->
        <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase mb-3">Competition Preferences</h2>
          <p class="text-sm text-gray-500">Competition preferences coming soon.</p>
        </div>
      </div>
    </div>
  `
})
export class PreferencesComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
}
