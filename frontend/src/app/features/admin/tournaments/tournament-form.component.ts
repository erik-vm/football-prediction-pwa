import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TournamentAdminService } from '../../../core/services/admin/tournament-admin.service';

@Component({
  selector: 'app-tournament-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ isEditMode() ? 'Edit' : 'Create' }} Tournament</h1>
        <p class="mt-2 text-sm text-gray-600">{{ isEditMode() ? 'Update tournament details' : 'Add a new tournament' }}</p>
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
        <form [formGroup]="tournamentForm" (ngSubmit)="onSubmit()" class="space-y-6 p-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Tournament Name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              [class.border-red-300]="tournamentForm.get('name')?.invalid && tournamentForm.get('name')?.touched"
            />
            @if (tournamentForm.get('name')?.invalid && tournamentForm.get('name')?.touched) {
              <p class="mt-1 text-sm text-red-600">Tournament name is required</p>
            }
          </div>

          <div>
            <label for="year" class="block text-sm font-medium text-gray-700">
              Year <span class="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="year"
              formControlName="year"
              min="2020"
              max="2030"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              [class.border-red-300]="tournamentForm.get('year')?.invalid && tournamentForm.get('year')?.touched"
            />
            @if (tournamentForm.get('year')?.invalid && tournamentForm.get('year')?.touched) {
              <p class="mt-1 text-sm text-red-600">Year must be between 2020 and 2030</p>
            }
          </div>

          <div>
            <div class="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                formControlName="isActive"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="isActive" class="ml-2 block text-sm font-medium text-gray-700">
                Active Tournament
              </label>
            </div>
            <p class="mt-1 text-sm text-gray-500">Only one tournament can be active at a time</p>
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
              [disabled]="tournamentForm.invalid || isSubmitting()"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ isSubmitting() ? 'Saving...' : 'Save Tournament' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TournamentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tournamentService = inject(TournamentAdminService);

  tournamentForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  tournamentId = signal<string | null>(null);

  constructor() {
    this.tournamentForm = this.fb.group({
      name: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2030)]],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.tournamentId.set(id);
      this.loadTournament(id);
    }
  }

  private loadTournament(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tournamentService.getTournament(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.tournamentForm.patchValue({
            name: response.data.name,
            year: response.data.year,
            isActive: response.data.isActive
          });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load tournament');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.tournamentForm.invalid) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.tournamentForm.value;
    const request = {
      name: formValue.name,
      year: formValue.year,
      isActive: formValue.isActive
    };

    const action = this.isEditMode()
      ? this.tournamentService.updateTournament(this.tournamentId()!, request)
      : this.tournamentService.createTournament(request);

    action.subscribe({
      next: () => {
        this.router.navigate(['/admin/tournaments']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to save tournament');
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/tournaments']);
  }
}
