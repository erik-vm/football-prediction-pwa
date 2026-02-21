export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsEarned?: number;
  submittedAt: Date;
}

export interface PredictionRequest {
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
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
