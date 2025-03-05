export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  groups: string[];
}

export interface Group {
  id: string;
  name: string;
}