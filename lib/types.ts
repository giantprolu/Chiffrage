// Types partagés pour l'application
export interface Entry {
  id: number;
  date: string;
  client: string;
  ticket: string | null;
  comment: string;
  time: number;
  type: string | null;
}

export interface FormationDay {
  id: number;
  date: string;
  label: string;
  time: number;
}

export interface CongeDay {
  id: number;
  date: string;
  label: string;
  time: number;
}

export interface StatsData {
  byClient: Record<string, number>;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
  formationByMonth: Record<string, number>;
  totalDays: number;
  totalFormation: number;
}
