import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Users, Briefcase, Award, GraduationCap, FileOutput, Plus, Trash2, ClipboardCheck } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useStudents } from '../contexts/StudentContext';
import type { StudentRegistration, ClassData, Test } from '../types/student';
import { supabase } from '../lib/supabase';
import { FullDateInput } from '../components/FullDateInput';
import { DateInput } from '../components/DateInput';

const SCHOOLS = [
  'Kings - Kathmandu',
  'Kings - Pokhara',
  'Hanasakiya - Chitwan',
  'External'
] as const;

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

export const StudentDetails: React.FC = () => {
  const { id } = useParams();
  const { students, loading, error, refreshStudents } = useStudents();
  const [classes, setClasses] = React.useState<ClassData[]>([]);
  const [isEditingClass, setIsEditingClass] = React.useState(false);
  const [classForm, setClassForm] = React.useState<Partial<ClassData>>({});
  const student = students.find(s => s.id === id);
  const [activeTab, setActiveTab] = React.useState<'classes' | 'tests'>('classes');
  const [tests, setTests] = React.useState<Test[]>([]);
  const [isAddingTest, setIsAddingTest] = React.useState(false);
  const [testForm, setTestForm] = React.useState<Partial<Test>>({
    type: 'jft_basic_a2',
    passed_date: ''
  });

  React.useEffect(() => {
    if (id) {
      fetchClasses();
      fetchTests();
    }
  }, [id]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('student_id', id)
        .order('passed_date', { ascending: false });

      if (error) throw error;
      setTests(data || []);

      // Update student status if they have passed a skill test
      if (data?.some(test => test.type === 'skill')) {
        const { error: updateError } = await supabase
          .from('students')
          .update({ status: 'eligibleForInterview' })
          .eq('id', id);

        if (updateError) throw updateError;
        await refreshStudents();
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
    }
  };

  const handleAddTest = async () => {
    if (!id || !testForm.type || !testForm.passed_date) return;

    try {
      const { error } = await supabase
        .from('tests')
        .insert([{
          student_id: id,
          type: testForm.type,
          skill_category: testForm.type === 'skill' ? testForm.skill_category : null,
          passed_date: testForm.passed_date
        }]);

      if (error) throw error;

      await fetchTests();
      await refreshStudents();
      setIsAddingTest(false);
      setTestForm({
        type: 'jft_basic_a2',
        passed_date: ''
      });
    } catch (err) {
      console.error('Error adding test:', err);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (error) throw error;
      await fetchTests();
    } catch (err) {
      console.error('Error deleting test:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('student_id', id);

      if (error) throw error;
      setClasses(data || []);
      setClassForm({
        school: '',
        class: '',
        section: '',
        roll_number: '',
        class_type: 'Language'
      });
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      await fetchClasses();
      await refreshStudents();
    } catch (err) {
      console.error('Error deleting class:', err);
    }
  };

  const handleClassSubmit = async () => {
    if (!id) return;

    try {
      const newClassData = {
        ...classForm,
        student_id: id
      };

      const { error } = await supabase
        .from('classes')
        .insert([newClassData]);

      if (error) throw error;

      await fetchClasses();
      await refreshStudents();
      setIsEditingClass(false);
      setClassForm({
        school: '',
        class: '',
        section: '',
        roll_number: '',
        class_type: 'Language'
      });
    } catch (err) {
      console.error('Error saving class data:', err);
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
                        statusColors[student.status || 'registered']
                      }`}>
                        {statusLabels[student.status || 'registered']}
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
                    <div className="flex border-b">
                      <button
                        onClick={() => setActiveTab('classes')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
                          activeTab === 'classes'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          Classes
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('tests')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
                          activeTab === 'tests'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className="w-5 h-5" />
                          Tests
                        </div>
                      </button>
                    </div>
                  </div>
                  {activeTab === 'classes' && !isEditingClass && (
                    <button
                      onClick={() => setIsEditingClass(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Enroll into Class
                    </button>
                  )}
                  {activeTab === 'tests' && !isAddingTest && (
                    <button
                      onClick={() => setIsAddingTest(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add Test Result
                    </button>
                  )}
                </div>

                {activeTab === 'classes' && (
                  isEditingClass ? (
                  <div className="bg-white border rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          School
                        </label>
                        <select
                          value={classForm.school || ''}
                          onChange={(e) => setClassForm(prev => ({ ...prev, school: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select School</option>
                          {SCHOOLS.map(school => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class
                        </label>
                        <input
                          type="text"
                          value={classForm.class || ''}
                          disabled={classForm.school === 'External'}
                          onChange={(e) => setClassForm(prev => ({ ...prev, class: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Class Type
                        </label>
                        <select
                          disabled={classForm.school === 'External'}
                          value={classForm.class_type || 'Language'}
                          onChange={(e) => setClassForm(prev => ({ ...prev, class_type: e.target.value as 'Language' | 'Skill' }))}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select Type</option>
                          <option value="Language">Language</option>
                          <option value="Skill">Skill</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          disabled={classForm.school === 'External'}
                          value={classForm.section || ''}
                          onChange={(e) => setClassForm(prev => ({ ...prev, section: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          disabled={classForm.school === 'External'}
                          value={classForm.roll_number || ''}
                          onChange={(e) => setClassForm(prev => ({ ...prev, roll_number: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingClass(false)}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      <button
                        onClick={handleClassSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Enroll into Class
                      </button>
                      </div>
                    </div>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No class information available
                  </div>
                ) : (
                  <div className="space-y-4">
                    {classes.map((classData) => (
                      <div key={classData.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {classData.school}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {classData.class_type} Class
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteClass(classData.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Class</p>
                            <p className="font-medium">{classData.class}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Section</p>
                            <p className="font-medium">{classData.section || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Roll Number</p>
                            <p className="font-medium">{classData.roll_number || '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
                )}

                {activeTab === 'tests' && (
                  <>
                    {isAddingTest ? (
                      <div className="bg-white border rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Test Type
                            </label>
                            <select
                              value={testForm.type}
                              onChange={(e) => setTestForm(prev => ({ 
                                ...prev, 
                                type: e.target.value as 'jft_basic_a2' | 'skill',
                                skill_category: e.target.value === 'skill' ? '' : undefined
                              }))}
                              className="w-full px-3 py-2 border rounded-md"
                            >
                              <option value="jft_basic_a2">JFT BASIC A2</option>
                              <option value="skill">Skill Test</option>
                            </select>
                          </div>
                          {testForm.type === 'skill' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Skill Category
                              </label>
                              <select
                                value={testForm.skill_category}
                                onChange={(e) => setTestForm(prev => ({ ...prev, skill_category: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-md"
                              >
                                <option value="">Select Category</option>
                                <option value="介護">介護</option>
                                <option value="宿泊">宿泊</option>
                                <option value="外食">外食</option>
                                <option value="建設">建設</option>
                                <option value="農業">農業</option>
                                <option value="ドライバー">ドライバー</option>
                                <option value="ビルクリーニング">ビルクリーニング</option>
                                <option value="グラウンドハンドリング">グラウンドハンドリング</option>
                              </select>
                            </div>
                          )}
                          <div className={testForm.type === 'skill' ? 'col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Passed Date
                            </label>
                            <DateInput
                              value={testForm.passed_date || ''}
                              onChange={(value) => setTestForm(prev => ({ ...prev, passed_date: value }))}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setIsAddingTest(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddTest}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            Add Test Result
                          </button>
                        </div>
                      </div>
                    ) : tests.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No test results available
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tests.map((test) => (
                          <div key={test.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {test.type === 'jft_basic_a2' ? 'JFT BASIC A2' : 'Skill Test'}
                                </h3>
                                {test.type === 'skill' && (
                                  <p className="text-sm text-gray-500">
                                    {test.skill_category}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteTest(test.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Passed Date</p>
                              <p className="font-medium">
                                {test.passed_date.split('-')[0]}/{test.passed_date.split('-')[1]}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};