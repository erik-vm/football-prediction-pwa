import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from '../../../core/services/match.service';
import { PredictionService } from '../../../core/services/prediction.service';
import { MatchDto } from '../../../shared/models/match.model';
import { PredictionDto } from '../../../shared/models/prediction.model';

@Component({
  selector: 'app-prediction-form',
  standalone: true,
  templateUrl: './prediction-form.component.html'
})
export class PredictionFormComponent implements OnInit, OnDestroy {
  match = signal<MatchDto | null>(null);
  existingPrediction = signal<PredictionDto | null>(null);
  homeScore = signal(0);
  awayScore = signal(0);
  countdown = signal('');
  loading = signal(false);
  error = signal('');
  success = signal('');

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private predictionService: PredictionService
  ) {}

  ngOnInit(): void {
    const matchId = Number(this.route.snapshot.paramMap.get('matchId'));
    this.loadMatch(matchId);
    this.loadExistingPrediction(matchId);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  private loadMatch(matchId: number): void {
    this.matchService.getUpcoming().subscribe({
      next: (matches) => {
        const found = matches.find(m => m.id === matchId);
        if (found) {
          this.match.set(found);
          this.startCountdown(found.kickoffTime);
        } else {
          this.matchService.getFinished().subscribe({
            next: (finished) => {
              const f = finished.find(m => m.id === matchId);
              if (f) this.match.set(f);
            }
          });
        }
      }
    });
  }

  private loadExistingPrediction(matchId: number): void {
    this.predictionService.getByMatch(matchId).subscribe({
      next: (prediction) => {
        this.existingPrediction.set(prediction);
        this.homeScore.set(prediction.homeScore);
        this.awayScore.set(prediction.awayScore);
      },
      error: () => {}
    });
  }

  private startCountdown(kickoffTime: string): void {
    const update = () => {
      const diff = new Date(kickoffTime).getTime() - Date.now();
      if (diff <= 0) {
        this.countdown.set('Deadline passed');
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.countdown.set(`${hours}h ${minutes}m ${seconds}s`);
    };
    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  adjustScore(team: 'home' | 'away', delta: number): void {
    if (team === 'home') {
      const newVal = this.homeScore() + delta;
      if (newVal >= 0) this.homeScore.set(newVal);
    } else {
      const newVal = this.awayScore() + delta;
      if (newVal >= 0) this.awayScore.set(newVal);
    }
  }

  savePrediction(): void {
    const m = this.match();
    if (!m) return;

    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    const request = { matchId: m.id, homeScore: this.homeScore(), awayScore: this.awayScore() };
    const existing = this.existingPrediction();

    const obs = existing
      ? this.predictionService.update(existing.id, request)
      : this.predictionService.create(request);

    obs.subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Prediction saved!');
        setTimeout(() => this.router.navigate(['/matches']), 1000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Failed to save prediction');
      }
    });
  }

  deletePrediction(): void {
    const existing = this.existingPrediction();
    if (!existing) return;

    this.loading.set(true);
    this.predictionService.delete(existing.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/matches']);
      },
      error: () => this.loading.set(false)
    });
  }

  goBack(): void {
    this.router.navigate(['/matches']);
  }
}
