import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Search } from 'lucide-react';
import { Logo } from '../components/Logo';
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

export const StudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { students, loading, error } = useStudents();

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.personalInfo.firstName.toLowerCase().includes(searchLower) ||
      student.personalInfo.lastName.toLowerCase().includes(searchLower) ||
      student.personalInfo.email.toLowerCase().includes(searchLower) ||
      student.enrollment.school.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          </div>
          <Link
            to="/student/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add New Student
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No students found</p>
              </div>
            )}

            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.personalInfo.firstName} {student.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.resume.firstNameKana} {student.resume.lastNameKana}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.personalInfo.phone}</div>
                      <div className="text-sm text-gray-500">{student.personalInfo.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.enrollment.school}</div>
                      <div className="text-sm text-gray-500">
                        Class: {student.enrollment.class}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[student.enrollment.status]
                      }`}>
                        {statusLabels[student.enrollment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/student/${student.id}`}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/student/${student.id}/edit`}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};