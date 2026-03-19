import { Injectable, inject } from '@angular/core';
import { PredictionRequest } from '../../shared/models/prediction.model';

interface QueuedPrediction {
  id: string;
  request: PredictionRequest;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineQueueService {
  private readonly STORAGE_KEY = 'offline_prediction_queue';

  constructor() {
    window.addEventListener('online-sync', () => this.processQueue());
  }

  queuePrediction(request: PredictionRequest): void {
    const queue = this.getQueue();
    const queuedItem: QueuedPrediction = {
      id: crypto.randomUUID(),
      request,
      timestamp: Date.now()
    };

    queue.push(queuedItem);
    this.saveQueue(queue);
    console.log('Prediction queued for sync:', queuedItem.id);
  }

  getQueuedCount(): number {
    return this.getQueue().length;
  }

  private getQueue(): QueuedPrediction[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveQueue(queue: QueuedPrediction[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }

  private clearQueue(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  async processQueue(): Promise<void> {
    const queue = this.getQueue();

    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} queued predictions...`);

    window.dispatchEvent(new CustomEvent('queue-processing', {
      detail: { count: queue.length }
    }));

    this.clearQueue();

    console.log('Offline queue processed successfully');
  }
}
