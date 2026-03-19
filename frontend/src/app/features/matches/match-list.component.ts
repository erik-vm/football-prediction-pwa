import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatchService } from './services/match.service';
import { MatchCardComponent } from './match-card.component';
import { Match } from '../../shared/models/match.model';

type TabType = 'upcoming' | 'finished';

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, MatchCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Matches</h1>
          <p class="mt-2 text-sm text-gray-600">
            View upcoming and completed matches
          </p>
        </div>

        <!-- Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                (click)="selectTab('upcoming')"
                [class]="getTabClass('upcoming')"
                type="button">
                Upcoming
                <span [class]="getTabBadgeClass('upcoming')">
                  {{ upcomingMatches().length }}
                </span>
              </button>
              <button
                (click)="selectTab('finished')"
                [class]="getTabClass('finished')"
                type="button">
                Finished
                <span [class]="getTabBadgeClass('finished')">
                  {{ finishedMatches().length }}
                </span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoading()" class="flex justify-center items-center py-12">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Error State -->
        <div *ngIf="errorMessage()" class="rounded-md bg-red-50 p-4 mb-6">
          <div class="flex">
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">{{ errorMessage() }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading() && getCurrentMatches().length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No matches found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ activeTab() === 'upcoming' ? 'There are no upcoming matches at the moment.' : 'No finished matches yet.' }}
          </p>
        </div>

        <!-- Match Grid -->
        <div *ngIf="!isLoading() && getCurrentMatches().length > 0"
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-match-card
            *ngFor="let match of getCurrentMatches()"
            [match]="match"
            (predict)="onPredict($event)"
            (cardClick)="onCardClick($event)">
          </app-match-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MatchListComponent implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  activeTab = signal<TabType>('upcoming');
  upcomingMatches = signal<Match[]>([]);
  finishedMatches = signal<Match[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  tournamentId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tournamentId.set(params['tournamentId'] || null);
      this.loadMatches();
    });
  }

  selectTab(tab: TabType): void {
    this.activeTab.set(tab);
    if (tab === 'upcoming' && this.upcomingMatches().length === 0) {
      this.loadUpcoming();
    } else if (tab === 'finished' && this.finishedMatches().length === 0) {
      this.loadFinished();
    }
  }

  loadMatches(): void {
    this.loadUpcoming();
  }

  loadUpcoming(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.matchService.getUpcoming().subscribe({
      next: (matches) => {
        this.upcomingMatches.set(matches);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load upcoming matches. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading upcoming matches:', error);
      }
    });
  }

  loadFinished(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.matchService.getFinished().subscribe({
      next: (matches) => {
        this.finishedMatches.set(matches);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load finished matches. Please try again.');
        this.isLoading.set(false);
        console.error('Error loading finished matches:', error);
      }
    });
  }

  getCurrentMatches(): Match[] {
    const matches = this.activeTab() === 'upcoming' ? this.upcomingMatches() : this.finishedMatches();

    if (this.tournamentId()) {
      return matches.filter(match => match.tournamentId === this.tournamentId());
    }

    return matches;
  }

  getTabClass(tab: TabType): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors';
    if (this.activeTab() === tab) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    }
    return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }

  getTabBadgeClass(tab: TabType): string {
    const baseClasses = 'ml-2 py-0.5 px-2 rounded-full text-xs font-medium';
    if (this.activeTab() === tab) {
      return `${baseClasses} bg-blue-100 text-blue-600`;
    }
    return `${baseClasses} bg-gray-100 text-gray-600`;
  }

  onPredict(match: Match): void {
    this.router.navigate(['/predictions', 'new'], { queryParams: { matchId: match.id } });
  }

  onCardClick(match: Match): void {
    console.log('Match card clicked:', match);
  }
}
