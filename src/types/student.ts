export interface PersonalInfo {
  firstName: string;  // required
  lastName: string;   // required
  gender: 'male' | 'female' | 'other';  // required
  dateOfBirth: string;  // required
  address: string;    // required
  phone: string;      // required
  email: string;      // required
  religion: string;
  country: string;    // required
  languages: string;  // optional
  maritalStatus: string;
  numberOfChildren: number;
}

export interface FamilyMember {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  relationship: string;
  job: string;
}

export interface EmergencyContact {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Education {
  startDate: string;
  endDate: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
}

export interface WorkExperience {
  startDate: string;
  endDate: string;
  company: string;
  position: string;
}

export interface Certificate {
  date: string;
  name: string;
}

export interface Resume {
  firstNameKana: string;
  lastNameKana: string;
  selfIntroduction: string;
  strength: string;
  weakness: string;
  hobbies: string;
  height: number;
  weight: number;
  shoeSize: number;
  possibleStartDate: string;
  jobCategory: string;
  dietaryRestriction: string;
  photo: string;
}

interface Class {
  school: string;
  class: string;
  batch: string;
  rollNumber: string;
  classType: 'Language' | 'Skill';
}

export interface Test {
  id: string;
  student_id: string;
  type: 'jft_basic_a2' | 'skill';
  skill_category?: string;
  passed_date: string;
  created_at: string;
  updated_at: string;
}

export interface StudentRegistration {
  id?: string;
  status?: string;
  personalInfo: PersonalInfo;
  familyMembers: FamilyMember[];
  emergencyContact: EmergencyContact;
  education: Education[];
  workExperience: WorkExperience[];
  certificates: Certificate[];
  resume: Resume;
}

export interface ClassData {
  id: string;
  student_id: string;
  school: string;
  class: string;
  batch: string;
  roll_number: string;
  class_type: 'Language' | 'Skill';
  created_at: string;
  updated_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  type: 'Photos' | 'Resume' | 'Certificates' | 'その他' | 'Passport' | "Driver's License";
  custom_type: string | null;
  file_name: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetails {
  id: string;
  document_id: string;
  notes?: string;
  document_number?: string;
  date_of_issue?: string;
  expiry_date?: string;
  place_of_issue?: string;
  license_type?: string;
  license_category?: string;
  created_at: string;
  updated_at: string;
}