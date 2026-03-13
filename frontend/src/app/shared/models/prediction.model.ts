export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePredictionRequest {
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}
