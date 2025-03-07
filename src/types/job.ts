export interface Job {
  id: string;
  client_id: string;
  accepting_organization: string;
  work_location: string;
  category: string;
  position_count: number;
  preferred_gender: 'no preference' | 'male only' | 'female only';
  candidates_min_count: number;
  interview_date: string | null;
  status: 'open' | 'filled' | 'cancelled' | 'on_hold' | 'candidates_selected';
  created_at: string;
  updated_at: string;
}