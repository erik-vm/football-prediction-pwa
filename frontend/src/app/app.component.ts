import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { SignalRService } from './core/services/signalr.service';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { BottomNavigationComponent } from './shared/components/bottom-navigation/bottom-navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, OfflineIndicatorComponent, BottomNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Football Prediction Game';

  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);

  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;
  isAdmin = this.authService.isAdmin;

  ngOnInit(): void {
    this.signalRService.startConnection();
  }

  logout(): void {
    this.authService.logout();
  }
}
