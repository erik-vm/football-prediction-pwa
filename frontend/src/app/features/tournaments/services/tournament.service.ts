import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Tournament } from '../../../shared/models/match.model';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private api = inject(ApiService);

  getAll(): Observable<Tournament[]> {
    return this.api.get<Tournament[]>('tournaments');
  }

  getById(id: string): Observable<Tournament> {
    return this.api.get<Tournament>(`tournaments/${id}`);
  }

  getActive(): Observable<Tournament[]> {
    return this.api.get<Tournament[]>('tournaments?status=active');
  }
}
