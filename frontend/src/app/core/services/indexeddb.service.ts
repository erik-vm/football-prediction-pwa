import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Match } from '../models/match.model';
import { PredictionWithMatch } from '../models/prediction.model';

export interface LeaderboardCache {
  id?: number;
  competitionCode: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService extends Dexie {
  matches!: Table<Match, string>;
  predictions!: Table<PredictionWithMatch, string>;
  leaderboards!: Table<LeaderboardCache, number>;

  constructor() {
    super('FootballPredictionDB');

    this.version(1).stores({
      matches: 'id, tournamentId, gameWeekId, isFinished, competitionCode, kickoffTime',
      predictions: 'prediction.id, prediction.matchId, prediction.userId, match.tournamentId',
      leaderboards: '++id, competitionCode, timestamp'
    });
  }

  async cacheMatches(matches: Match[]): Promise<void> {
    try {
      await this.matches.bulkPut(matches);
      console.log('Cached matches to IndexedDB:', matches.length);
    } catch (error) {
      console.error('Error caching matches:', error);
    }
  }

  async getMatches(tournamentId?: string): Promise<Match[]> {
    try {
      if (tournamentId) {
        return await this.matches.where('tournamentId').equals(tournamentId).toArray();
      }
      return await this.matches.toArray();
    } catch (error) {
      console.error('Error getting matches from IndexedDB:', error);
      return [];
    }
  }

  async getMatch(matchId: string): Promise<Match | undefined> {
    try {
      return await this.matches.get(matchId);
    } catch (error) {
      console.error('Error getting match from IndexedDB:', error);
      return undefined;
    }
  }

  async cachePredictions(predictions: PredictionWithMatch[]): Promise<void> {
    try {
      await this.predictions.bulkPut(predictions);
      console.log('Cached predictions to IndexedDB:', predictions.length);
    } catch (error) {
      console.error('Error caching predictions:', error);
    }
  }

  async getPredictions(tournamentId?: string): Promise<PredictionWithMatch[]> {
    try {
      if (tournamentId) {
        return await this.predictions
          .where('match.tournamentId')
          .equals(tournamentId)
          .toArray();
      }
      return await this.predictions.toArray();
    } catch (error) {
      console.error('Error getting predictions from IndexedDB:', error);
      return [];
    }
  }

  async cacheLeaderboard(competitionCode: string, data: any): Promise<void> {
    try {
      await this.leaderboards.put({
        competitionCode,
        data,
        timestamp: Date.now()
      });
      console.log('Cached leaderboard to IndexedDB:', competitionCode);
    } catch (error) {
      console.error('Error caching leaderboard:', error);
    }
  }

  async getLeaderboard(competitionCode: string, maxAge: number = 3600000): Promise<any | null> {
    try {
      const cached = await this.leaderboards
        .where('competitionCode')
        .equals(competitionCode)
        .first();

      if (cached && (Date.now() - cached.timestamp) < maxAge) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting leaderboard from IndexedDB:', error);
      return null;
    }
  }

  async clearOldData(maxAge: number = 86400000): Promise<void> {
    try {
      const cutoff = Date.now() - maxAge;
      await this.leaderboards.where('timestamp').below(cutoff).delete();
      console.log('Cleared old cached data');
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await this.matches.clear();
      await this.predictions.clear();
      await this.leaderboards.clear();
      console.log('Cleared all IndexedDB data');
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  }
}
