import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Users, Briefcase, Award, GraduationCap, FileOutput } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useStudents } from '../contexts/StudentContext';
import type { StudentRegistration, EnrollmentData } from '../types/student';
import { supabase } from '../lib/supabase';
import { FullDateInput } from '../components/FullDateInput';


const statusColors = {
  learningJapanese: 'bg-blue-100 text-blue-800',
  learningSpecificSkill: 'bg-purple-100 text-purple-800',
  eligibleForInterview: 'bg-yellow-100 text-yellow-800',
  selectedForJob: 'bg-green-100 text-green-800',
  jobStarted: 'bg-emerald-100 text-emerald-800',
  dropped: 'bg-red-100 text-red-800'
};

const statusLabels = {
  learningJapanese: 'Learning Japanese',
  learningSpecificSkill: 'Learning Specific Skill',
  eligibleForInterview: 'Eligible for Interview',
  selectedForJob: 'Selected for Job',
  jobStarted: 'Job Started',
  dropped: 'Dropped'
};

export const StudentDetails: React.FC = () => {
  const { id } = useParams();
  const { students, loading, error } = useStudents();
  const [enrollment, setEnrollment] = React.useState<EnrollmentData | null>(null);
  const [isEditingEnrollment, setIsEditingEnrollment] = React.useState(false);
  const [enrollmentForm, setEnrollmentForm] = React.useState<Partial<EnrollmentData>>({});
  const student = students.find(s => s.id === id);

  React.useEffect(() => {
    if (id) {
      fetchEnrollment();
    }
  }, [id]);

  const fetchEnrollment = async () => {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', id)
        .single();

      if (error) throw error;
      setEnrollment(data);
      setEnrollmentForm(data || {});
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  };

  const handleEnrollmentSubmit = async () => {
    if (!id) return;

    try {
      const enrollmentData = {
        ...enrollmentForm,
        student_id: id
      };

      if (enrollment) {
        // Update existing enrollment
        const { error } = await supabase
          .from('enrollments')
          .update(enrollmentData)
          .eq('id', enrollment.id);

        if (error) throw error;
      } else {
        // Create new enrollment
        const { error } = await supabase
          .from('enrollments')
          .insert([enrollmentData]);

        if (error) throw error;
      }

      await fetchEnrollment();
      setIsEditingEnrollment(false);
    } catch (err) {
      console.error('Error saving enrollment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-2">Error loading student details</p>
          <Link to="/" className="text-blue-500 hover:underline">
            Return to Student List
          </Link>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
          <Link to="/" className="text-blue-500 hover:underline">
            Return to Student List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to List
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/student/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
            >
              <Edit className="w-5 h-5" />
              Edit Student
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">

            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    {student.resume.photo ? (
                      <img
                        src={student.resume.photo}
                        alt=""
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-500 font-medium">
                          {student.personalInfo.firstName[0]}
                          {student.personalInfo.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          {student.personalInfo.firstName} {student.personalInfo.lastName}
                        </h1>
                        <p className="text-gray-500">
                          {student.resume.firstNameKana} {student.resume.lastNameKana}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[student.enrollment.status]
                      }`}>
                        {statusLabels[student.enrollment.status]}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Phone className="w-4 h-4" />
                        {student.personalInfo.phone}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Mail className="w-4 h-4" />
                        {student.personalInfo.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {student.personalInfo.address}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {student.personalInfo.dateOfBirth}
                      </div>
                    </div>
                  </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Enrollment Information */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-medium text-gray-900">Enrollment Information</h2>
                  </div>
                  <button
                    onClick={() => setIsEditingEnrollment(!isEditingEnrollment)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {isEditingEnrollment ? 'Cancel' : enrollment ? 'Edit' : 'Add Enrollment'}
                  </button>
                </div>
                {isEditingEnrollment ? (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School
                        </label>
                        <input
                          type="text"
                          value={enrollmentForm.school || ''}
                          onChange={(e) => setEnrollmentForm(prev => ({ ...prev, school: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class
                        </label>
                        <input
                          type="text"
                          value={enrollmentForm.class || ''}
                          onChange={(e) => setEnrollmentForm(prev => ({ ...prev, class: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          value={enrollmentForm.section || ''}
                          onChange={(e) => setEnrollmentForm(prev => ({ ...prev, section: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          value={enrollmentForm.roll_number || ''}
                          onChange={(e) => setEnrollmentForm(prev => ({ ...prev, roll_number: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <FullDateInput
                          value={enrollmentForm.start_date || ''}
                          onChange={(value) => setEnrollmentForm(prev => ({ ...prev, start_date: value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <FullDateInput
                          value={enrollmentForm.end_date || ''}
                          onChange={(value) => setEnrollmentForm(prev => ({ ...prev, end_date: value }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={enrollmentForm.status || 'learningJapanese'}
                        onChange={(e) => setEnrollmentForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="learningJapanese">Learning Japanese</option>
                        <option value="learningSpecificSkill">Learning Specific Skill</option>
                        <option value="eligibleForInterview">Eligible for Interview</option>
                        <option value="selectedForJob">Selected for Job</option>
                        <option value="jobStarted">Job Started</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleEnrollmentSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        {enrollment ? 'Update' : 'Create'} Enrollment
                      </button>
                    </div>
                  </div>
                ) : enrollment ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">School</p>
                      <p className="font-medium">{enrollment.school}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium">{enrollment.class}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Section</p>
                      <p className="font-medium">{enrollment.section}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Roll Number</p>
                      <p className="font-medium">{enrollment.roll_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{enrollment.start_date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{enrollment.end_date}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[enrollment.status]
                      }`}>
                        {statusLabels[enrollment.status]}
                      </span>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No enrollment information available
                  </div>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};