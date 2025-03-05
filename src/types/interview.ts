export interface Interview {
  id: string;
  job_id: string;
  date: string;
  time: string;
  location: string;
  type: 'online' | 'offline' | 'hybrid';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewWithDetails extends Interview {
  job: {
    id: string;
    accepting_organization: string;
    category: string;
    client: {
      id: string;
      company_name: string;
    };
  };
  candidates: {
    id: string;
    student: {
      id: string;
      personal_info: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
      resume: {
        firstNameKana: string;
        lastNameKana: string;
      };
    };
  }[];
}