import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TournamentService } from '../../../core/services/tournament.service';
import { TournamentDto } from '../../../shared/models/tournament.model';

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './tournament-list.component.html'
})
export class TournamentListComponent implements OnInit {
  tournaments = signal<TournamentDto[]>([]);
  loading = signal(false);

  constructor(private tournamentService: TournamentService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
