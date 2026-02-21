import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, OfflineIndicatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Football Prediction Game';

  private authService = inject(AuthService);

  // Expose AuthService signals to template
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  logout(): void {
    this.authService.logout();
  }
}
