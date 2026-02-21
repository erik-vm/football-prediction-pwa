export interface Match {
  id: string;
  tournamentId: string;
  gameWeekId: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: Date;
  stage: TournamentStage;
  stageMultiplier: number;
  homeScore?: number;
  awayScore?: number;
  isFinished: boolean;
}

export enum TournamentStage {
  GROUP_STAGE = 'GROUP_STAGE',
  ROUND_OF_16 = 'ROUND_OF_16',
  QUARTER_FINALS = 'QUARTER_FINALS',
  SEMI_FINALS = 'SEMI_FINALS',
  FINAL = 'FINAL'
}

export interface Tournament {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
}

export interface GameWeek {
  id: string;
  tournamentId: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
}
