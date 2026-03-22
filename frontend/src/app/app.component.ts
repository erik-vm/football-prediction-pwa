import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { BottomNavigationComponent } from './shared/components/bottom-navigation/bottom-navigation.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, OfflineIndicatorComponent, HeaderComponent, BottomNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Football Prediction PWA';
  authService = inject(AuthService);
}
