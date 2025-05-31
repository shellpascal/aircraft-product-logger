
export enum AircraftModel {
  GLOBAL = "Global",
  CHALLENGER = "Challenger",
}

export interface Picture {
  id: string;
  dataUrl: string;
  name: string;
}

export interface AircraftRecord {
  id: string;
  aircraftModel: AircraftModel;
  acNumber: string; // A/C#
  moNumber?: string; // MO#
  monumentNumber: string;
  startDate: string;
  finishDate: string;
  issues: string;
  pictures: Picture[];
  notes: string;
  createdAt: number;
}

export type FormState = Omit<AircraftRecord, 'id' | 'createdAt' | 'pictures'> & { pictures: File[] };