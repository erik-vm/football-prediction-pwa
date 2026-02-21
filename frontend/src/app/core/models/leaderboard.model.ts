export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  predictionPoints: number;
  bonusPoints: number;
  exactScores: number;
  correctWinners: number;
  totalPredictions: number;
}

export interface WeeklyLeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  weeklyPoints: number;
  bonusPoints: number;
  exactScores: number;
  correctWinners: number;
}

export interface UserStats {
  userId: string;
  username: string;
  totalPredictions: number;
  exactScores: number;
  correctWinners: number;
  totalPoints: number;
  predictionPoints: number;
  bonusPoints: number;
  currentRank?: number;
  accuracyRate: number;
  weeklyPerformance?: WeeklyPerformance[];
}

export interface WeeklyPerformance {
  gameWeekId: string;
  gameWeekNumber: number;
  points: number;
}
