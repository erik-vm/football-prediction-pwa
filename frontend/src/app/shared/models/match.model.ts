export interface MatchDto {
  id: string;
  tournamentId: string;
  gameWeekId: string | null;
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
