import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Users, Briefcase, Award, GraduationCap, FileOutput } from 'lucide-react';
import { Logo } from '../components/Logo';
import { JapaneseCV } from '../components/JapaneseCV';
import { useStudents } from '../contexts/StudentContext';
import type { StudentRegistration } from '../types/student';


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
  const student = students.find(s => s.id === id);
  const [showCV, setShowCV] = React.useState(false);

  const handlePrint = () => {
    window.print();
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
            <button
              onClick={() => setShowCV(!showCV)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FileOutput className="w-5 h-5" />
              {showCV ? 'Show Details' : 'Generate CV'}
            </button>
            {showCV && (
              <button onClick={handlePrint} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5" />
                Print CV
              </button>
            )}
            <Link
              to={`/student/${id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
            >
              <Edit className="w-5 h-5" />
              Edit Student
            </Link>
          </div>
        </div>
        
        {showCV ? (
          <JapaneseCV student={student} />
        ) : (
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
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-medium text-gray-900">Enrollment Information</h2>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">School</p>
                      <p className="font-medium">{student.enrollment.school}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Class</p>
                      <p className="font-medium">{student.enrollment.class}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};