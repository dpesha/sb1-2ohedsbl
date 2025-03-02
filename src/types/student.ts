export interface PersonalInfo {
  firstName: string;  // required
  lastName: string;   // required
  gender: 'male' | 'female' | 'other';  // required
  dateOfBirth: string;  // required
  address: string;    // required
  phone: string;      // required
  email: string;      // required
  religion: string;
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

export interface IdentityDocument {
  documentType: string;
  number: string;
  dateOfIssue: string;
  placeOfIssue: string;
  expiryDate: string;
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

export interface Enrollment {
  school: string;
  class: string;
  section: string;
  rollNumber: string;
  startDate: string;
  endDate: string;
  status: 'learningJapanese' | 'learningSpecificSkill' | 'eligibleForInterview' | 'selectedForJob' | 'jobStarted' | 'dropped';
}

export interface StudentRegistration {
  id?: string;
  personalInfo: PersonalInfo;
  familyMembers: FamilyMember[];
  identityDocument: IdentityDocument;
  emergencyContact: EmergencyContact;
  education: Education[];
  workExperience: WorkExperience[];
  certificates: Certificate[];
  resume: Resume;
  enrollment: Enrollment;
}