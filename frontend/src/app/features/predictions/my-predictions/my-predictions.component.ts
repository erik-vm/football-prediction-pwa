import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PredictionService } from '../../../core/services/prediction.service';
import { PredictionDto } from '../../../shared/models/prediction.model';

@Component({
  selector: 'app-my-predictions',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './my-predictions.component.html'
})
export class MyPredictionsComponent implements OnInit {
  predictions = signal<PredictionDto[]>([]);
  loading = signal(false);

  constructor(private predictionService: PredictionService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.predictionService.getMyPredictions().subscribe({
      next: (preds) => {
        this.predictions.set(preds);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getStatusClass(status: string): string {
    if (status === 'SCORED') return 'bg-green-100 text-green-700';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  }
}
