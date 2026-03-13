export interface Match {
  id: string;
  tournamentId: string;
  gameWeekId: string | null;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  homeScore: number | null;
  awayScore: number | null;
  isFinished: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  season: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GameWeek {
  id: string;
  tournamentId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
