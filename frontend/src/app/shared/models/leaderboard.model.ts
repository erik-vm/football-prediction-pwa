export interface LeaderboardEntryDto {
  userId: string;
  username: string;
  totalPoints: number;
  totalPredictions: number;
  averagePoints: number;
  accuracy: number;
  rank: number;
}
