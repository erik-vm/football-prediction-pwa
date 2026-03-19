import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../core/services/offline.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!offlineService.isOnline()) {
      <div class="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
        ⚠️ You are currently offline. Some features may be unavailable.
      </div>
    }
  `
})
export class OfflineIndicatorComponent {
  offlineService = inject(OfflineService);
}
