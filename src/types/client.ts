export interface Client {
  id: string;
  company_name: string;
  address: string | null;
  website: string | null;
  industry: string | null;
  contact_person: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}