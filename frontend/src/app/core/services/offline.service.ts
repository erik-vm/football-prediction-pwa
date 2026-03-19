import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  isOnline = signal<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  private updateOnlineStatus(status: boolean): void {
    this.isOnline.set(status);

    if (status) {
      console.log('Connection restored');
      this.triggerSync();
    } else {
      console.log('Connection lost - working offline');
    }
  }

  private triggerSync(): void {
    window.dispatchEvent(new CustomEvent('online-sync'));
  }
}
