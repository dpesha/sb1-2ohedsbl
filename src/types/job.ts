export interface Job {
  id: string;
  client_id: string;
  accepting_organization: string;
  work_location: string;
  category: string;
  position_count: number;
  status: 'open' | 'filled' | 'cancelled' | 'on_hold' | 'candidates_selected' | 'interview_scheduled';
  created_at: string;
  updated_at: string;
}