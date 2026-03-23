import { MatchDto } from './match.model';

export interface PredictionDto {
  id: number;
  userId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
  pointsEarned: number | null;
  status: string;
  competitionCode: string;
  createdAt: string;
  updatedAt: string;
  match?: MatchDto;
}

export interface PredictionRequest {
  userId?: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
}
