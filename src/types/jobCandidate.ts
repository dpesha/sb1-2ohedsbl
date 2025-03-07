export interface JobCandidate {
  id: string;
  job_id: string;
  student_id: string;
  status: 'pending' | 'selected' | 'rejected' | 'passed' | 'failed' | 'didnot_participate';
  created_at: string;
  updated_at: string;
}

export interface EligibleStudent {
  id: string;
  personal_info: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  resume: {
    jobCategory: string;
    firstNameKana: string;
    lastNameKana: string;
  };
}