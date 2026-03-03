import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetitionService } from '../../../core/services/competition.service';
import { Competition } from '../../../core/models/competition.model';

@Component({
  selector: 'app-competition-selector',
  imports: [CommonModule, FormsModule],
  templateUrl: './competition-selector.component.html',
  styleUrl: './competition-selector.component.scss'
})
export class CompetitionSelectorComponent implements OnInit {
  private competitionService = inject(CompetitionService);

  selectedCompetitionCode = input<string>('');
  competitionChange = output<string>();

  competitions = signal<Competition[]>([]);
  isOpen = signal(false);

  ngOnInit(): void {
    this.loadCompetitions();
  }

  loadCompetitions(): void {
    this.competitionService.getCompetitions(true).subscribe({
      next: (response) => {
        if (response.data) {
          this.competitions.set(response.data);
        }
      },
      error: (error) => {
        console.error('Failed to load competitions:', error);
      }
    });
  }

  selectCompetition(competitionCode: string): void {
    this.competitionChange.emit(competitionCode);
    this.isOpen.set(false);
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  get selectedCompetition(): Competition | undefined {
    return this.competitions().find(c => c.code === this.selectedCompetitionCode());
  }
}
