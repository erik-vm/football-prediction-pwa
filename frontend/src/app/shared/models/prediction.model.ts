import { MatchDto } from './match.model';

export interface PredictionDto {
  id: string;
  userId: string;
  matchId: string;
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
  userId?: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}
