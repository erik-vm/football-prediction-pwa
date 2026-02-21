import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitionPreferenceService } from '../../../core/services/competition-preference.service';
import { CompetitionService } from '../../../core/services/competition.service';
import { Competition } from '../../../core/models/competition.model';

@Component({
  selector: 'app-competition-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competition-preferences.component.html',
  styleUrl: './competition-preferences.component.css'
})
export class CompetitionPreferencesComponent implements OnInit {
  private preferenceService = inject(CompetitionPreferenceService);
  private competitionService = inject(CompetitionService);

  competitions = signal<Competition[]>([]);
  selectedCodes = signal<Set<string>>(new Set());
  isSaving = signal(false);
  successMessage = signal<string | null>(null);

  isLoading = this.preferenceService.isLoading;
  error = this.preferenceService.error;
  preferences = this.preferenceService.preferences;

  ngOnInit(): void {
    this.loadCompetitions();
    this.loadPreferences();
  }

  private loadCompetitions(): void {
    this.competitionService.getCompetitions(true).subscribe({
      next: (response) => {
        if (response.data) {
          this.competitions.set(response.data);
        }
      }
    });
  }

  private loadPreferences(): void {
    this.preferenceService.getUserPreferences().subscribe({
      next: (preferences) => {
        const codes = new Set(preferences.map(p => p.competitionCode));
        this.selectedCodes.set(codes);
      }
    });
  }

  togglePreference(competitionCode: string): void {
    this.isSaving.set(true);
    this.successMessage.set(null);

    this.preferenceService.togglePreference(competitionCode).subscribe({
      next: () => {
        const newCodes = new Set(this.selectedCodes());
        if (newCodes.has(competitionCode)) {
          newCodes.delete(competitionCode);
        } else {
          newCodes.add(competitionCode);
        }
        this.selectedCodes.set(newCodes);
        this.isSaving.set(false);
        this.showSuccessMessage();
      },
      error: () => {
        this.isSaving.set(false);
      }
    });
  }

  selectAll(): void {
    const allCodes = new Set(this.competitions().map(c => c.code));
    const currentCodes = this.selectedCodes();
    const newCodes = new Set([...currentCodes]);

    this.isSaving.set(true);
    this.successMessage.set(null);

    const addPromises = this.competitions()
      .filter(c => !currentCodes.has(c.code))
      .map(c => this.preferenceService.addPreference(c.code).toPromise());

    Promise.all(addPromises).then(() => {
      this.selectedCodes.set(allCodes);
      this.isSaving.set(false);
      this.showSuccessMessage();
    }).catch(() => {
      this.isSaving.set(false);
    });
  }

  deselectAll(): void {
    const currentCodes = this.selectedCodes();

    this.isSaving.set(true);
    this.successMessage.set(null);

    const removePromises = Array.from(currentCodes).map(code =>
      this.preferenceService.removePreference(code).toPromise()
    );

    Promise.all(removePromises).then(() => {
      this.selectedCodes.set(new Set());
      this.isSaving.set(false);
      this.showSuccessMessage();
    }).catch(() => {
      this.isSaving.set(false);
    });
  }

  isSelected(competitionCode: string): boolean {
    return this.selectedCodes().has(competitionCode);
  }

  private showSuccessMessage(): void {
    this.successMessage.set('Preferences saved successfully');
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
