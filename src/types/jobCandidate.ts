export interface JobCandidate {
  id: string;
  job_id: string;
  student_id: string;
  interview_id: string | null;
  status: 'pending' | 'selected' | 'rejected';
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
  enrollment: {
    school: string;
    class: string;
    status: string;
  };
}