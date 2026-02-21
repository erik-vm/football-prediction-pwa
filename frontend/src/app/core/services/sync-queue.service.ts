import { Injectable, signal } from '@angular/core';
import { PredictionRequest } from '../models/prediction.model';

export interface QueuedPrediction {
  id: string;
  request: PredictionRequest;
  timestamp: number;
  retryCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncQueueService {
  private queueKey = 'prediction_sync_queue';
  private queueSignal = signal<QueuedPrediction[]>([]);
  private isSyncingSignal = signal<boolean>(false);

  queue = this.queueSignal.asReadonly();
  isSyncing = this.isSyncingSignal.asReadonly();

  constructor() {
    this.loadQueue();
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.queueKey);
      if (stored) {
        const queue = JSON.parse(stored) as QueuedPrediction[];
        this.queueSignal.set(queue);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(this.queueSignal()));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  addToQueue(request: PredictionRequest): string {
    const queuedPrediction: QueuedPrediction = {
      id: this.generateId(),
      request,
      timestamp: Date.now(),
      retryCount: 0
    };

    const currentQueue = this.queueSignal();
    this.queueSignal.set([...currentQueue, queuedPrediction]);
    this.saveQueue();

    console.log('Added prediction to sync queue:', queuedPrediction.id);
    return queuedPrediction.id;
  }

  removeFromQueue(id: string): void {
    const currentQueue = this.queueSignal();
    this.queueSignal.set(currentQueue.filter(item => item.id !== id));
    this.saveQueue();
    console.log('Removed prediction from sync queue:', id);
  }

  updateRetryCount(id: string): void {
    const currentQueue = this.queueSignal();
    const updated = currentQueue.map(item =>
      item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
    );
    this.queueSignal.set(updated);
    this.saveQueue();
  }

  clearQueue(): void {
    this.queueSignal.set([]);
    localStorage.removeItem(this.queueKey);
    console.log('Cleared sync queue');
  }

  getQueueSize(): number {
    return this.queueSignal().length;
  }

  hasQueuedItems(): boolean {
    return this.queueSignal().length > 0;
  }

  getQueuedItems(): QueuedPrediction[] {
    return this.queueSignal();
  }

  setIsSyncing(syncing: boolean): void {
    this.isSyncingSignal.set(syncing);
  }

  private generateId(): string {
    return `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async processQueue(
    syncFn: (request: PredictionRequest) => Promise<boolean>
  ): Promise<void> {
    if (this.isSyncingSignal()) {
      console.log('Sync already in progress');
      return;
    }

    const queue = this.getQueuedItems();
    if (queue.length === 0) {
      console.log('No items in queue to process');
      return;
    }

    this.setIsSyncing(true);
    console.log(`Processing ${queue.length} queued predictions`);

    for (const item of queue) {
      try {
        const success = await syncFn(item.request);

        if (success) {
          this.removeFromQueue(item.id);
        } else {
          if (item.retryCount < 3) {
            this.updateRetryCount(item.id);
          } else {
            console.warn('Max retry count reached for queued item:', item.id);
            this.removeFromQueue(item.id);
          }
        }
      } catch (error) {
        console.error('Error processing queued item:', error);
        if (item.retryCount < 3) {
          this.updateRetryCount(item.id);
        } else {
          this.removeFromQueue(item.id);
        }
      }
    }

    this.setIsSyncing(false);
    console.log('Queue processing completed');
  }
}
