import React from 'react';
import { Link,useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Search, FileText } from 'lucide-react';
import { useStudents } from '../contexts/StudentContext';
import type { ClassData, Test } from '../types/student';
import { supabase } from '../lib/supabase';
import type { StudentRegistration } from '../types/student';


const statusColors = {
  registered: 'bg-gray-100 text-gray-800',
  learningJapanese: 'bg-blue-100 text-blue-800',
  learningSpecificSkill: 'bg-purple-100 text-purple-800',
  eligibleForInterview: 'bg-yellow-100 text-yellow-800',
  selectedForJobInterview: 'bg-green-100 text-green-800',
  passedInterview: 'bg-teal-100 text-teal-800',
  jobStarted: 'bg-emerald-100 text-emerald-800',
  dropped: 'bg-red-100 text-red-800'
};

const statusLabels = {
  registered: 'Registered',
  learningJapanese: 'Learning Japanese',
  learningSpecificSkill: 'Learning Specific Skill',
  eligibleForInterview: 'Eligible for Interview',
  selectedForJobInterview: 'Selected for Interview',
  passedInterview: 'Passed Interview',
  jobStarted: 'Job Started',
  dropped: 'Dropped'
};

export const StudentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isStudent, setIsStudent] = React.useState(false);
  const [classes, setClasses] = React.useState<Record<string, ClassData[]>>({});
  const [tests, setTests] = React.useState<Record<string, Test[]>>({});
  const [checkingRole, setCheckingRole] = React.useState(true);
  const { students, loading, error } = useStudents();

  React.useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*');

        if (error) throw error;

        // Group classes by student_id
        const classMap = (data || []).reduce((acc, classData) => {
          if (!acc[classData.student_id]) {
            acc[classData.student_id] = [];
          }
          acc[classData.student_id].push(classData);
          return acc;
        }, {} as Record<string, ClassData[]>);

        setClasses(classMap);
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    const fetchTests = async () => {
      try {
        const { data, error } = await supabase
          .from('tests')
          .select('*');

        if (error) throw error;

        // Group tests by student_id
        const testMap = (data || []).reduce((acc, testData) => {
          if (!acc[testData.student_id]) {
            acc[testData.student_id] = [];
          }
          acc[testData.student_id].push(testData);
          return acc;
        }, {} as Record<string, Test[]>);

        setTests(testMap);
      } catch (err) {
        console.error('Error fetching tests:', err);
      }
    };

    fetchClasses();
    fetchTests();
  }, []);

  React.useEffect(() => {
    const checkStudentStatus = async () => {
      try {
        const { data: studentStatus, error: roleError } = await supabase.rpc('is_student');
        if (roleError) throw roleError;
        setIsStudent(studentStatus);
      } catch (err) {
        console.error('Error checking student status:', err);
      } finally {
        setCheckingRole(false);
      }
    };

    checkStudentStatus();
  }, []);

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.personalInfo.firstName.toLowerCase().includes(searchLower) ||
      student.personalInfo.lastName.toLowerCase().includes(searchLower) ||
      student.personalInfo.email.toLowerCase().includes(searchLower) ||
      (classes[student.id]?.some(c => 
        c.school.toLowerCase().includes(searchLower)
      ) ?? false)
    );
  });

  const navigate = useNavigate();

  // Function to handle row click
  const handleRowClick = (url) => {
    navigate(url);
  };

  
  const getAge = (date) => {
    const today = new Date();
    return Math.floor(
      (today.getTime() - new Date(date).getTime()) / 
      (365.25 * 24 * 60 * 60 * 1000)
    );
};


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isStudent && (
          <div className="flex justify-end mb-8">
          <Link
            to="/student/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add New Student
          </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {!isStudent && (
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
          )}

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
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exams
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
                  <tr key={student.id} className="hover:bg-gray-50" onClick={() => handleRowClick(isStudent ? '#' :`/student/${student.id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                         {student.personalInfo.firstName} {student.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getAge(student.personalInfo.dateOfBirth)} years, {student.personalInfo.gender}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {classes[student.id]?.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {classes[student.id][classes[student.id].length - 1].school}
                          </div>
                          {classes[student.id][classes[student.id].length - 1].school !== 'External' && (
                            <div className="text-sm text-gray-500">
                              {classes[student.id][classes[student.id].length - 1].class},{classes[student.id][classes[student.id].length - 1].batch}
                              {classes[student.id].length > 1 && (
                                <span className="ml-1 text-xs text-gray-400">
                                  (+{classes[student.id].length - 1} more)
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tests[student.id]?.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {tests[student.id].map(test => (
                              <div key={test.id}>
                              {test.type === 'jft_basic_a2'
                                ? 'JFT Basic A2'
                                : test.skill_category}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[student.status || 'registered'] || statusColors.registered
                      }`}>
                        {statusLabels[student.status || 'registered'] || statusLabels.registered}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/student/${student.id}/cv`}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <FileText className="w-5 h-5" />
                        </Link>
                        <Link
                          to={isStudent ? '#' : `/student/${student.id}`}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          {!isStudent && <Eye className="w-5 h-5" />}
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