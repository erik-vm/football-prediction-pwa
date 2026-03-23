export interface MatchDto {
  id: number;
  tournamentId: number;
  gameWeekId: number;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  competitionCode: string;
  season: string;
  matchday: number;
  isFinished: boolean;
}
