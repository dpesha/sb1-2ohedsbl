import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Tabs } from '../components/Tabs';
import { PersonalDetailsStep } from '../components/steps/PersonalDetailsStep';
import { FamilyMembersStep } from '../components/steps/FamilyMembersStep';
import { EducationStep } from '../components/steps/EducationStep';
import { WorkExperienceStep } from '../components/steps/WorkExperienceStep';
import { CertificatesStep } from '../components/steps/CertificatesStep';
import { ResumeStep } from '../components/steps/ResumeStep';
import { EnrollmentStep } from '../components/steps/EnrollmentStep';
import type {
  StudentRegistration,
  PersonalInfo,
  FamilyMember,
  IdentityDocument,
  EmergencyContact,
  Education,
  WorkExperience,
  Certificate,
  Resume,
  Enrollment
} from '../types/student';

const TABS = [
  'Personal Details',
  'Family',
  'Education',
  'Work',
  'Certificates',
  'Resume',
  'Enrollment'
];

const initialData: StudentRegistration = {
  personalInfo: {
    firstName: '',
    lastName: '',
    gender: 'male',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    religion: '',
    maritalStatus: '',
    numberOfChildren: 0
  },
  familyMembers: [],
  identityDocument: {
    documentType: '',
    number: '',
    dateOfIssue: '',
    placeOfIssue: '',
    expiryDate: ''
  },
  emergencyContact: {
    name: '',
    address: '',
    phone: '',
    email: ''
  },
  education: [],
  workExperience: [],
  certificates: [],
  resume: {
    firstNameKana: '',
    lastNameKana: '',
    selfIntroduction: '',
    strength: '',
    weakness: '',
    hobbies: '',
    height: 0,
    weight: 0,
    shoeSize: 0,
    possibleStartDate: '',
    jobCategory: '',
    dietaryRestriction: '',
    photo: ''
  },
  enrollment: {
    school: '',
    class: '',
    section: '',
    rollNumber: '',
    startDate: '',
    endDate: '',
    status: 'learningJapanese'
  }
};

export const StudentForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([]);
  const [formData, setFormData] = React.useState<StudentRegistration>(initialData);

  // Load existing student data when editing
  React.useEffect(() => {
    const loadStudent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            id: data.id,
            personalInfo: data.personal_info,
            familyMembers: data.family_members || [],
            identityDocument: data.identity_document || {},
            emergencyContact: data.emergency_contact || {},
            education: data.education || [],
            workExperience: data.work_experience || [],
            certificates: data.certificates || [],
            resume: data.resume || {},
            enrollment: data.enrollment || {}
          });

          // Set completed steps based on loaded data
          const completed: number[] = [];
          if (data.personal_info?.firstName && data.personal_info?.lastName) completed.push(0);
          if (data.family_members?.length > 0) completed.push(1);
          if (data.education?.length > 0) completed.push(2);
          if (data.work_experience?.length > 0) completed.push(3);
          if (data.certificates?.length > 0) completed.push(4);
          if (data.resume?.firstNameKana && data.resume?.lastNameKana) completed.push(5);
          if (data.enrollment?.school && data.enrollment?.class) completed.push(6);
          setCompletedSteps(completed);
        }
      } catch (err) {
        console.error('Error loading student:', err);
        setError(err instanceof Error ? err.message : 'Failed to load student');
      }
    };

    loadStudent();
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (!user) {
        throw new Error('Not authenticated');
      }

      const studentData = {
        personal_info: formData.personalInfo,
        family_members: formData.familyMembers,
        identity_document: formData.identityDocument,
        emergency_contact: formData.emergencyContact,
        education: formData.education,
        work_experience: formData.workExperience,
        certificates: formData.certificates,
        resume: formData.resume,
        enrollment: formData.enrollment,
        user_id: user.id
      };

      if (id) {
        await supabase
          .from('students')
          .update({
            ...studentData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        await supabase
          .from('students')
          .insert([{
            ...studentData,
            created_at: new Date().toISOString()
          }]);
      }

      navigate('/');
    } catch (error) {
      console.error('Error saving student:', error);
      setError(error instanceof Error ? error.message : 'Failed to save student');
    }
  };

  const handlePersonalInfoChange = (data: PersonalInfo) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: data
    }));
    
    if (data.firstName && data.lastName && data.email) {
      setCompletedSteps(prev => 
        prev.includes(0) ? prev : [...prev, 0]
      );
    }
  };

  const handleFamilyMembersChange = (data: FamilyMember[]) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: data
    }));
    
    if (data.some(member => 
      member.name && member.relationship && member.age > 0
    )) {
      setCompletedSteps(prev => 
        prev.includes(1) ? prev : [...prev, 1]
      );
    }
  };

  const handleIdentityDocumentChange = (data: IdentityDocument) => {
    setFormData(prev => ({
      ...prev,
      identityDocument: data
    }));
  };

  const handleEmergencyContactChange = (data: EmergencyContact) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: data
    }));
  };

  const handleEducationChange = (data: Education[]) => {
    setFormData(prev => ({
      ...prev,
      education: data
    }));
    
    if (data.some(edu => 
      edu.institution && edu.degree && edu.startDate
    )) {
      setCompletedSteps(prev => 
        prev.includes(2) ? prev : [...prev, 2]
      );
    }
  };

  const handleWorkExperienceChange = (data: WorkExperience[]) => {
    setFormData(prev => ({
      ...prev,
      workExperience: data
    }));
    
    if (data.some(work => 
      work.company && work.position && work.startDate
    )) {
      setCompletedSteps(prev => 
        prev.includes(3) ? prev : [...prev, 3]
      );
    }
  };

  const handleCertificatesChange = (data: Certificate[]) => {
    setFormData(prev => ({
      ...prev,
      certificates: data
    }));
    
    if (data.some(cert => 
      cert.name && cert.date
    )) {
      setCompletedSteps(prev => 
        prev.includes(4) ? prev : [...prev, 4]
      );
    }
  };

  const handleResumeChange = (data: Resume) => {
    setFormData(prev => ({
      ...prev,
      resume: data
    }));
    
    if (
      data.firstNameKana &&
      data.lastNameKana &&
      data.selfIntroduction &&
      data.jobCategory
    ) {
      setCompletedSteps(prev => 
        prev.includes(5) ? prev : [...prev, 5]
      );
    }
  };

  const handleEnrollmentChange = (data: Enrollment) => {
    setFormData(prev => ({
      ...prev,
      enrollment: data
    }));
    
    if (
      data.school &&
      data.class &&
      data.startDate &&
      data.status
    ) {
      setCompletedSteps(prev => 
        prev.includes(6) ? prev : [...prev, 6]
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Logo />
            <h1 className="text-2xl font-bold text-gray-900">
              {id ? 'Edit Student' : 'New Student Registration'}
            </h1>
          </div>
          <p className="text-gray-600">Please fill out all the required information</p>
        </div>

        <Tabs
          tabs={TABS}
          currentTab={currentTab}
          onChange={setCurrentTab}
          completedSteps={completedSteps}
        />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {currentTab === 0 && (
            <PersonalDetailsStep
              personalInfo={formData.personalInfo}
              identityDocument={formData.identityDocument}
              emergencyContact={formData.emergencyContact}
              onPersonalInfoChange={handlePersonalInfoChange}
              onIdentityDocumentChange={handleIdentityDocumentChange}
              onEmergencyContactChange={handleEmergencyContactChange}
            />
          )}
          {currentTab === 1 && (
            <FamilyMembersStep
              data={formData.familyMembers}
              onChange={handleFamilyMembersChange}
            />
          )}
          {currentTab === 2 && (
            <EducationStep
              data={formData.education}
              onChange={handleEducationChange}
            />
          )}
          {currentTab === 3 && (
            <WorkExperienceStep
              data={formData.workExperience}
              onChange={handleWorkExperienceChange}
            />
          )}
          {currentTab === 4 && (
            <CertificatesStep
              data={formData.certificates}
              onChange={handleCertificatesChange}
            />
          )}
          {currentTab === 5 && (
            <ResumeStep
              data={formData.resume}
              onChange={handleResumeChange}
            />
          )}
          {currentTab === 6 && (
            <EnrollmentStep
              data={formData.enrollment}
              onChange={handleEnrollmentChange}
            />
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            {id ? 'Update Student' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  );
};