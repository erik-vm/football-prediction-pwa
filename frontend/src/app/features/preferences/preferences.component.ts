import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StorageService } from '../../core/services/storage.service';
import { MatchService } from '../matches/services/match.service';

const SELECTED_COMPS_KEY = 'selected_competitions';

const COMPETITION_NAMES: Record<string, string> = {
  PL: 'Premier League',
  PD: 'La Liga',
  BL1: 'Bundesliga',
  SA: 'Serie A',
  FL1: 'Ligue 1',
  CL: 'UEFA Champions League',
  PPL: 'Primeira Liga',
  DED: 'Eredivisie',
  ELC: 'Championship',
  BSA: 'Brasileirao',
  WC: 'FIFA World Cup',
  EC: 'European Championship'
};

@Component({
  selector: 'app-preferences',
  standalone: true,
  template: `
    <div class="bg-gray-100 px-4 pt-4 pb-8">
      <div class="max-w-lg mx-auto">
        <!-- User Info -->
        <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
          <div class="flex items-center gap-4 mb-3">
            <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-lg">{{ user()?.username }}</div>
              <div class="text-sm text-gray-500">{{ user()?.email }}</div>
            </div>
          </div>
        </div>

        <!-- Competition Preferences -->
        <div class="bg-white rounded-2xl shadow-md p-4 mb-4">
          <h2 class="text-sm font-semibold text-orange-500 uppercase mb-1">Selected Competitions</h2>
          <p class="text-xs text-gray-500 mb-4">Choose which competitions to display in your home feed</p>

          @for (comp of availableCompetitions(); track comp) {
            <label class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 cursor-pointer">
              <span class="text-gray-800">{{ getCompetitionName(comp) }}</span>
              <input type="checkbox"
                     [checked]="isSelected(comp)"
                     (change)="toggleCompetition(comp)"
                     class="w-5 h-5 text-cyan-500 rounded focus:ring-cyan-500" />
            </label>
          }
        </div>
      </div>
    </div>
  `
})
export class PreferencesComponent implements OnInit {
  private authService = inject(AuthService);
  private storage = inject(StorageService);
  private matchService = inject(MatchService);

  user = this.authService.currentUser;
  availableCompetitions = signal<string[]>([]);
  selectedCompetitions = signal<string[]>([]);

  ngOnInit(): void {
    this.matchService.getCompetitions().subscribe({
      next: (codes) => {
        this.availableCompetitions.set(codes);
        const saved = this.storage.getObject<string[]>(SELECTED_COMPS_KEY);
        this.selectedCompetitions.set(saved && saved.length > 0 ? saved : [...codes]);
      }
    });
  }

  isSelected(code: string): boolean {
    return this.selectedCompetitions().includes(code);
  }

  toggleCompetition(code: string): void {
    const current = this.selectedCompetitions();
    if (current.includes(code)) {
      if (current.length <= 1) return;
      this.selectedCompetitions.set(current.filter(c => c !== code));
    } else {
      this.selectedCompetitions.set([...current, code]);
    }
    this.storage.setObject(SELECTED_COMPS_KEY, this.selectedCompetitions());
  }

  getCompetitionName(code: string): string {
    return COMPETITION_NAMES[code] || code;
  }
}
