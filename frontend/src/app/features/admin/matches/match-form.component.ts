import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatchAdminService } from '../../../core/services/admin/match-admin.service';
import { TournamentAdminService } from '../../../core/services/admin/tournament-admin.service';
import { MatchService } from '../../../core/services/match.service';
import { Tournament, GameWeek, TournamentStage } from '../../../core/models/match.model';

@Component({
  selector: 'app-match-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode() ? 'Edit' : 'Create' }} Match</h1>
        <p class="mt-2 text-sm text-gray-600">{{ isEditMode() ? 'Update match details' : 'Add a new match' }}</p>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      } @else if (error()) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p class="text-red-800">{{ error() }}</p>
        </div>
      }

      <div class="bg-white shadow sm:rounded-lg">
        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
          @if (!isEditMode()) {
            <div>
              <label for="tournamentId" class="block text-sm font-medium text-gray-700">
                Tournament <span class="text-red-500">*</span>
              </label>
              <select
                id="tournamentId"
                formControlName="tournamentId"
                (change)="onTournamentChange()"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                [class.border-red-300]="matchForm.get('tournamentId')?.invalid && matchForm.get('tournamentId')?.touched"
              >
                <option value="">Select a tournament</option>
                @for (tournament of tournaments(); track tournament.id) {
                  <option [value]="tournament.id">{{ tournament.name }} ({{ tournament.year }})</option>
                }
              </select>
              @if (matchForm.get('tournamentId')?.invalid && matchForm.get('tournamentId')?.touched) {
                <p class="mt-1 text-sm text-red-600">Tournament is required</p>
              }
            </div>

            <div>
              <label for="gameWeekId" class="block text-sm font-medium text-gray-700">
                Game Week <span class="text-red-500">*</span>
              </label>
              <select
                id="gameWeekId"
                formControlName="gameWeekId"
                [disabled]="!matchForm.get('tournamentId')?.value"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm disabled:bg-gray-100"
                [class.border-red-300]="matchForm.get('gameWeekId')?.invalid && matchForm.get('gameWeekId')?.touched"
              >
                <option value="">Select a game week</option>
                @for (gameWeek of gameWeeks(); track gameWeek.id) {
                  <option [value]="gameWeek.id">Week {{ gameWeek.weekNumber }}</option>
                }
              </select>
              @if (matchForm.get('gameWeekId')?.invalid && matchForm.get('gameWeekId')?.touched) {
                <p class="mt-1 text-sm text-red-600">Game week is required</p>
              }
            </div>
          }

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="homeTeam" class="block text-sm font-medium text-gray-700">
                Home Team <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="homeTeam"
                formControlName="homeTeam"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                [class.border-red-300]="matchForm.get('homeTeam')?.invalid && matchForm.get('homeTeam')?.touched"
              />
              @if (matchForm.get('homeTeam')?.invalid && matchForm.get('homeTeam')?.touched) {
                <p class="mt-1 text-sm text-red-600">Home team is required</p>
              }
            </div>

            <div>
              <label for="awayTeam" class="block text-sm font-medium text-gray-700">
                Away Team <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="awayTeam"
                formControlName="awayTeam"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                [class.border-red-300]="matchForm.get('awayTeam')?.invalid && matchForm.get('awayTeam')?.touched"
              />
              @if (matchForm.get('awayTeam')?.invalid && matchForm.get('awayTeam')?.touched) {
                <p class="mt-1 text-sm text-red-600">Away team is required</p>
              }
              @if (matchForm.errors?.['teamsMatch']) {
                <p class="mt-1 text-sm text-red-600">Home and away teams must be different</p>
              }
            </div>
          </div>

          <div>
            <label for="kickoffTime" class="block text-sm font-medium text-gray-700">
              Kickoff Time <span class="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="kickoffTime"
              formControlName="kickoffTime"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              [class.border-red-300]="matchForm.get('kickoffTime')?.invalid && matchForm.get('kickoffTime')?.touched"
            />
            @if (matchForm.get('kickoffTime')?.invalid && matchForm.get('kickoffTime')?.touched) {
              <p class="mt-1 text-sm text-red-600">Kickoff time is required</p>
            }
          </div>

          <div>
            <label for="stage" class="block text-sm font-medium text-gray-700">
              Tournament Stage <span class="text-red-500">*</span>
            </label>
            <select
              id="stage"
              formControlName="stage"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              [class.border-red-300]="matchForm.get('stage')?.invalid && matchForm.get('stage')?.touched"
            >
              <option value="">Select a stage</option>
              @for (stage of stages; track stage.value) {
                <option [value]="stage.value">{{ stage.label }}</option>
              }
            </select>
            @if (matchForm.get('stage')?.invalid && matchForm.get('stage')?.touched) {
              <p class="mt-1 text-sm text-red-600">Tournament stage is required</p>
            }
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="matchForm.invalid || isSubmitting()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ isSubmitting() ? 'Saving...' : 'Save Match' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MatchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private matchAdminService = inject(MatchAdminService);
  private tournamentService = inject(TournamentAdminService);
  private matchService = inject(MatchService);

  matchForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  matchId = signal<string | null>(null);
  tournaments = signal<Tournament[]>([]);
  gameWeeks = signal<GameWeek[]>([]);

  stages = [
    { value: TournamentStage.GROUP_STAGE, label: 'Group Stage' },
    { value: TournamentStage.ROUND_OF_16, label: 'Round of 16' },
    { value: TournamentStage.QUARTER_FINALS, label: 'Quarter Finals' },
    { value: TournamentStage.SEMI_FINALS, label: 'Semi Finals' },
    { value: TournamentStage.FINAL, label: 'Final' }
  ];

  constructor() {
    this.matchForm = this.fb.group({
      tournamentId: ['', Validators.required],
      gameWeekId: ['', Validators.required],
      homeTeam: ['', Validators.required],
      awayTeam: ['', Validators.required],
      kickoffTime: ['', Validators.required],
      stage: ['', Validators.required]
    }, { validators: this.teamsValidator });
  }

  ngOnInit(): void {
    this.loadTournaments();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.matchId.set(id);
      this.loadMatch(id);
    }
  }

  private teamsValidator(group: FormGroup): { [key: string]: boolean } | null {
    const homeTeam = group.get('homeTeam')?.value;
    const awayTeam = group.get('awayTeam')?.value;

    if (homeTeam && awayTeam && homeTeam.toLowerCase() === awayTeam.toLowerCase()) {
      return { teamsMatch: true };
    }
    return null;
  }

  private loadTournaments(): void {
    this.tournamentService.getAllTournaments().subscribe({
      next: (response) => {
        this.tournaments.set(response.data ?? []);
      },
      error: (err) => {
        this.error.set('Failed to load tournaments');
      }
    });
  }

  onTournamentChange(): void {
    const tournamentId = this.matchForm.get('tournamentId')?.value;
    if (tournamentId) {
      this.loadGameWeeks(tournamentId);
    } else {
      this.gameWeeks.set([]);
    }
    this.matchForm.patchValue({ gameWeekId: '' });
  }

  private loadGameWeeks(tournamentId: string): void {
    this.matchService.getGameWeeks(tournamentId).subscribe({
      next: (response) => {
        this.gameWeeks.set(response.data ?? []);
      },
      error: (err) => {
        this.error.set('Failed to load game weeks');
      }
    });
  }

  private loadMatch(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.matchAdminService.getMatch(id).subscribe({
      next: (response) => {
        if (response.data) {
          const match = response.data;
          const kickoffDate = new Date(match.kickoffTime);
          const localDateTime = new Date(kickoffDate.getTime() - kickoffDate.getTimezoneOffset() * 60000)
            .toISOString().slice(0, 16);

          this.matchForm.patchValue({
            tournamentId: match.tournamentId,
            gameWeekId: match.gameWeekId,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            kickoffTime: localDateTime,
            stage: match.stage
          });

          this.matchForm.get('tournamentId')?.disable();
          this.matchForm.get('gameWeekId')?.disable();
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load match');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.matchForm.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.matchForm.getRawValue();
    const kickoffTime = new Date(formValue.kickoffTime).toISOString();

    if (this.isEditMode()) {
      const updateRequest = {
        homeTeam: formValue.homeTeam,
        awayTeam: formValue.awayTeam,
        kickoffTime: kickoffTime,
        stage: formValue.stage
      };

      this.matchAdminService.updateMatch(this.matchId()!, updateRequest).subscribe({
        next: () => {
          this.router.navigate(['/admin/matches']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to update match');
          this.isSubmitting.set(false);
        }
      });
    } else {
      const createRequest = {
        tournamentId: formValue.tournamentId,
        gameWeekId: formValue.gameWeekId,
        homeTeam: formValue.homeTeam,
        awayTeam: formValue.awayTeam,
        kickoffTime: kickoffTime,
        stage: formValue.stage
      };

      this.matchAdminService.createMatch(createRequest).subscribe({
        next: () => {
          this.router.navigate(['/admin/matches']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Failed to create match');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/matches']);
  }
}
