export interface LeaderboardEntryDto {
  userId: number;
  username: string;
  totalPoints: number;
  totalPredictions: number;
  averagePoints: number;
  accuracy: number;
  rank: number;
}
