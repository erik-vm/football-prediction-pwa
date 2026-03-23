import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';

interface CompetitionPref {
  code: string;
  name: string;
  selected: boolean;
}

const ALL_COMPETITIONS: { code: string; name: string }[] = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'CL', name: 'UEFA Champions League' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'ELC', name: 'Championship' },
  { code: 'BSA', name: 'Brasileirao' },
  { code: 'WC', name: 'FIFA World Cup' },
  { code: 'EC', name: 'European Championship' }
];

@Component({
  selector: 'app-preferences',
  standalone: true,
  templateUrl: './preferences.component.html'
})
export class PreferencesComponent implements OnInit {
  private readonly PREFS_KEY = 'selected_competitions';
  competitions = signal<CompetitionPref[]>([]);
  username = signal('');

  constructor(
    private authService: AuthService,
    private storage: StorageService
  ) {}

  ngOnInit(): void {
    this.username.set(this.authService.user()?.username || '');
    const saved = this.storage.getJson<string[]>(this.PREFS_KEY) || [];
    this.competitions.set(
      ALL_COMPETITIONS.map(c => ({
        ...c,
        selected: saved.length === 0 || saved.includes(c.code)
      }))
    );
  }

  toggleCompetition(code: string): void {
    this.competitions.update(comps =>
      comps.map(c => c.code === code ? { ...c, selected: !c.selected } : c)
    );
    this.savePreferences();
  }

  private savePreferences(): void {
    const selected = this.competitions().filter(c => c.selected).map(c => c.code);
    this.storage.setJson(this.PREFS_KEY, selected);
  }

  logout(): void {
    this.authService.logout();
  }
}
