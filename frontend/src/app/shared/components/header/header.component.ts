import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  private readonly THEME_KEY = 'dark_mode';
  isDark = signal(false);

  constructor(
    private authService: AuthService,
    private storage: StorageService
  ) {
    this.isDark.set(this.storage.get(this.THEME_KEY) === 'true');
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
    this.storage.set(this.THEME_KEY, String(this.isDark()));
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDark()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
