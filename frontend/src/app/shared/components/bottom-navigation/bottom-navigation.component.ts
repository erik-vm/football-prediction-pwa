import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

type NavItem = { path: string; label: string; icon: string };

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div class="flex justify-around items-center py-2">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path"
             class="flex flex-col items-center gap-1 px-3 py-1 min-w-[64px]"
             [class]="isActive(item.path) ? 'text-cyan-500' : 'text-gray-500'">
            @switch (item.icon) {
              @case ('matches') {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              @case ('leaderboard') {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              @case ('profile') {
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            }
            <span class="text-xs font-medium">{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class BottomNavigationComponent {
  private router = inject(Router);
  activeRoute = signal<string>('');

  navItems: NavItem[] = [
    { path: '/matches', label: 'Games', icon: 'matches' },
    { path: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
    { path: '/predictions', label: 'Profile', icon: 'profile' }
  ];

  constructor() {
    this.activeRoute.set(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.activeRoute.set(e.urlAfterRedirects));
  }

  isActive(path: string): boolean {
    return this.activeRoute().startsWith(path);
  }
}
