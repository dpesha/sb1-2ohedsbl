export interface StudentDocument {
  id: string;
  student_id: string;
  type: 'Photos' | 'Passport' | 'Driver\'s License' | 'その他';
  custom_type?: string;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}