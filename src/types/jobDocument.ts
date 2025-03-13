export interface JobDocument {
  id: string;
  job_id: string;
  type: '求人票' | '会社説明' | 'その他';
  custom_type?: string;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}