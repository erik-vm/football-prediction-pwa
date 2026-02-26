export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  createdAt: Date;
  updatedAt: Date;
  matchDescription?: string;
  kickoffTime?: Date;
  isMatchFinished?: boolean;
  actualHomeScore?: number;
  actualAwayScore?: number;
}

export interface PredictionRequest {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface PredictionWithMatch {
  prediction: Prediction;
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    kickoffTime: Date;
    homeScore?: number;
    awayScore?: number;
    isFinished: boolean;
  };
}
