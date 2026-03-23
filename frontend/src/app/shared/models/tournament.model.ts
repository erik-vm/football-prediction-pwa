export interface TournamentDto {
  id: string;
  name: string;
  code: string;
  season: string;
  startDate: string;
  endDate: string;
  country: string | null;
  type: string | null;
  logoUrl: string | null;
}
