export interface StudentDocument {
  id: string;
  student_id: string;
  type: 'Photos' | 'Passport' | 'Driver\'s License' | 'その他';
  custom_type?: string;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
  details?: DocumentDetails;
}

export interface DocumentDetails {
  id: string;
  document_id: string;
  document_number?: string;
  date_of_issue?: string;
  expiry_date?: string;
  place_of_issue?: string;
  license_type?: string;
  license_category?: string;
  created_at: string;
  updated_at: string;
}