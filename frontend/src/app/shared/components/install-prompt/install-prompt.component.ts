import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-install-prompt',
  imports: [CommonModule],
  templateUrl: './install-prompt.component.html',
  styleUrl: './install-prompt.component.scss'
})
export class InstallPromptComponent implements OnInit {
  showPrompt = signal(false);
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  private readonly DISMISSED_KEY = 'install-prompt-dismissed';
  private readonly DISMISSED_TIMESTAMP_KEY = 'install-prompt-dismissed-timestamp';
  private readonly DAYS_BEFORE_RESHOWING = 7;

  ngOnInit(): void {
    this.checkIfShouldShow();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;

      if (this.shouldShowPrompt()) {
        this.showPrompt.set(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.showPrompt.set(false);
      this.deferredPrompt = null;
    });
  }

  private checkIfShouldShow(): void {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.showPrompt.set(false);
      return;
    }

    if ((navigator as any).standalone === true) {
      this.showPrompt.set(false);
      return;
    }
  }

  private shouldShowPrompt(): boolean {
    const dismissed = localStorage.getItem(this.DISMISSED_KEY);

    if (dismissed !== 'true') {
      return true;
    }

    const dismissedTimestamp = localStorage.getItem(this.DISMISSED_TIMESTAMP_KEY);

    if (!dismissedTimestamp) {
      return true;
    }

    const daysSinceDismissed = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60 * 24);

    return daysSinceDismissed >= this.DAYS_BEFORE_RESHOWING;
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    this.deferredPrompt.prompt();

    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      this.showPrompt.set(false);
    }

    this.deferredPrompt = null;
  }

  dismiss(): void {
    this.showPrompt.set(false);
    localStorage.setItem(this.DISMISSED_KEY, 'true');
    localStorage.setItem(this.DISMISSED_TIMESTAMP_KEY, Date.now().toString());
  }
}
