export type JobType = 'process_place';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: JobType;
  payload: {
    placeId: string;
    row: Record<string, string>;
  };
  status: JobStatus;
  attempts: number;
  error: string | null;
  scheduled_for: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessPlacePayload {
  placeId: string;
  row: Record<string, string>;
}
