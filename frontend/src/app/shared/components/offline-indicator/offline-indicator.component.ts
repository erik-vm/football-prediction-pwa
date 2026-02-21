import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-indicator',
  imports: [CommonModule],
  templateUrl: './offline-indicator.component.html',
  styleUrl: './offline-indicator.component.scss'
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = signal(false);
  isDismissed = signal(false);

  private readonly DISMISSED_KEY = 'offline-indicator-dismissed';

  ngOnInit(): void {
    this.isOffline.set(!navigator.onLine);
    this.isDismissed.set(localStorage.getItem(this.DISMISSED_KEY) === 'true');

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    this.isOffline.set(false);
    this.isDismissed.set(false);
    localStorage.removeItem(this.DISMISSED_KEY);
  };

  private handleOffline = (): void => {
    this.isOffline.set(true);
    this.isDismissed.set(false);
    localStorage.removeItem(this.DISMISSED_KEY);
  };

  dismiss(): void {
    this.isDismissed.set(true);
    localStorage.setItem(this.DISMISSED_KEY, 'true');
  }
}
