import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TournamentDto } from '../../shared/models/tournament.model';

@Injectable({ providedIn: 'root' })
export class TournamentService {
  constructor(private api: ApiService) {}

  getAll(): Observable<TournamentDto[]> {
    return this.api.get<TournamentDto[]>('/tournaments');
  }
}
