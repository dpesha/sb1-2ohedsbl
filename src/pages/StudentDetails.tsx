import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, FileText, Users, Briefcase, Award, GraduationCap, FileOutput, Plus, Trash2, ClipboardCheck, Upload, Download, Loader2, X } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Logo } from '../components/Logo';
import { useStudents } from '../contexts/StudentContext';

// Set worker source for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
import { FormField } from '../components/FormField';
import type { StudentRegistration, ClassData, Test, StudentDocument } from '../types/student';
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
  selectedForJob: 'bg-green-100 text-green-800',
  jobStarted: 'bg-emerald-100 text-emerald-800',
  dropped: 'bg-red-100 text-red-800'
};

const statusLabels = {
  registered: 'Registered',
  learningJapanese: 'Learning Japanese',
  learningSpecificSkill: 'Learning Specific Skill',
  eligibleForInterview: 'Eligible for Interview',
  selectedForJob: 'Selected for Job',
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
  const [activeTab, setActiveTab] = React.useState<'classes' | 'tests' | 'documents'>('classes');
  const [tests, setTests] = React.useState<Test[]>([]);
  const [isAddingTest, setIsAddingTest] = React.useState(false);
  const [testForm, setTestForm] = React.useState<Partial<Test>>({
    type: 'jft_basic_a2',
    passed_date: ''
  });
  const [documents, setDocuments] = React.useState<StudentDocument[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [documentType, setDocumentType] = React.useState<StudentDocument['type']>('Photos');
  const [customType, setCustomType] = React.useState('');
  const [downloadingFiles, setDownloadingFiles] = React.useState<Record<string, boolean>>({});
  const [documentDetailsForm, setDocumentDetailsForm] = React.useState<Partial<DocumentDetails>>({});
  const [editingDocumentId, setEditingDocumentId] = React.useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = React.useState<Record<string, DocumentDetails>>({});
  const [previewData, setPreviewData] = React.useState<{ url: string; type: 'image' | 'pdf' } | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [numPages, setNumPages] = React.useState<number | null>(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  React.useEffect(() => {
    if (id) {
      fetchClasses();
      fetchTests();
      fetchDocuments();
    }
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('student_documents') 
        .select(`
          *,
          details:student_document_details(*)
        `)
        .eq('student_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Create a map of document details
      const detailsMap: Record<string, DocumentDetails> = {};
      data?.forEach(doc => {
        if (doc.details && doc.details[0]) {
          detailsMap[doc.id] = doc.details[0];
        }
      });
      setDocumentDetails(detailsMap);
      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only PDF and image files (PNG, JPEG) are allowed');
      return;
    }

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);
      setShowPreview(true);
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);

      // Generate unique file name with student ID prefix
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}/${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save document record
      const { data: docData, error: dbError } = await supabase
        .from('student_documents')
        .insert({
          student_id: id,
          type: documentType,
          custom_type: documentType === 'その他' ? customType : null,
          file_name: file.name,
          file_url: fileName
        })
        .select()
        .single();

      if (dbError) throw dbError;

      await fetchDocuments();
      setDocumentType('Photos');
      setCustomType('');
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: StudentDocument) => {
    try {
      setDownloadingFiles(prev => ({ ...prev, [doc.id]: true }));

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('student-documents')
        .getPublicUrl(doc.file_url);

      if (urlError) throw urlError;
      
      // For images and PDFs, show preview
      if (doc.file_name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
        setPreviewData({
          url: publicUrl,
          type: doc.file_name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image'
        });
        setShowPreview(true);
        setDownloadingFiles(prev => ({ ...prev, [doc.id]: false }));
        return;
      }

      // Download file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('student-documents')
        .download(doc.file_url);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file. Please try again later.');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleSaveDetails = async () => {
    if (!editingDocumentId) return;

    const existingDetails = documentDetails[editingDocumentId];

    try {
      if (existingDetails) {
        // Update existing details
        const { error } = await supabase
          .from('student_document_details')
          .update(documentDetailsForm)
          .eq('id', existingDetails.id);

        if (error) throw error;
      } else {
        // Insert new details
        const { error } = await supabase
          .from('student_document_details')
          .insert({
            document_id: editingDocumentId,
            ...documentDetailsForm
          });

        if (error) throw error;
      }

      await fetchDocuments();
      setEditingDocumentId(null);
      setDocumentDetailsForm({});
    } catch (err) {
      console.error('Error saving document details:', err);
      alert('Error saving document details. Please try again.');
    }
  };

  const handleEditDetails = (doc: StudentDocument) => {
    setEditingDocumentId(doc.id);
    setDocumentDetailsForm(documentDetails[doc.id] || {});
  };

  const handleDeleteDocument = async (document: StudentDocument) => {
    try {
      // Delete file from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('student-documents')
        .remove([document.file_url]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('student_documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;

      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

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
              to={`/student/${id}/cv`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <FileOutput className="w-5 h-5" />
              View CV
            </Link>
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
                      <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px ${
                          activeTab === 'documents'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Documents
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
                          Batch
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
                            <p className="text-sm text-gray-500">Batch</p>
                            <p className="font-medium">{classData.batch || '-'}</p>
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

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    {/* Upload Form */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <select
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value as StudentDocument['type'])}
                          className="px-3 py-2 border rounded-md"
                        >
                          <option value="Photos">Photos</option>
                          <option value="Passport">Passport</option>
                          <option value="Driver's License">Driver's License</option>
                          <option value="その他">その他</option>
                        </select>
                        
                        {documentType === 'その他' && (
                          <input
                            type="text"
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            placeholder="Document Type"
                            className="px-3 py-2 border rounded-md flex-1"
                          />
                        )}
                        
                        <div className="relative">
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.png,.jpg,.jpeg"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isUploading}
                          />
                          <button
                            className={`inline-flex items-center gap-2 px-4 py-2 ${
                              isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white rounded-md`}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload Document
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {uploadError && (
                        <p className="text-sm text-red-600">{uploadError}</p>
                      )}
                    </div>

                    {/* Document List */}
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No documents uploaded yet
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {doc.type === 'その他' ? doc.custom_type : doc.type}
                                </h3>
                                <p className="text-sm text-gray-500 mb-2">{doc.file_name}</p>
                                {(doc.type === 'Passport' || doc.type === 'Driver\'s License') && (
                                  <div className="text-xs text-gray-500">
                                    {documentDetails[doc.id] ? (
                                      <>
                                        {documentDetails[doc.id].document_number && (
                                          <p>Document Number: {documentDetails[doc.id].document_number}</p>
                                        )}
                                        {documentDetails[doc.id].date_of_issue && (
                                          <p>Issue Date: {documentDetails[doc.id].date_of_issue}</p>
                                        )}
                                        {documentDetails[doc.id].expiry_date && (
                                          <p>Expiry Date: {documentDetails[doc.id].expiry_date}</p>
                                        )}
                                        {documentDetails[doc.id].place_of_issue && (
                                          <p>Place of Issue: {documentDetails[doc.id].place_of_issue}</p>
                                        )}
                                        {doc.type === 'Driver\'s License' && documentDetails[doc.id].license_type && (
                                          <p>License Type: {documentDetails[doc.id].license_type}</p>
                                        )}
                                        {doc.type === 'Driver\'s License' && documentDetails[doc.id].license_category && (
                                          <p>License Category: {documentDetails[doc.id].license_category}</p>
                                        )}
                                        <button
                                          onClick={() => handleEditDetails(doc)}
                                          className="text-blue-500 hover:text-blue-600 mt-1"
                                        >
                                          Edit Details
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        onClick={() => setEditingDocumentId(doc.id)}
                                        className="text-blue-500 hover:text-blue-600"
                                      >
                                        Add Details
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="text-blue-500 hover:text-blue-600"
                                  disabled={downloadingFiles[doc.id]}
                                >
                                  {downloadingFiles[doc.id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {editingDocumentId === doc.id && (
                              <div className="mt-4 border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">
                                  {documentDetails[doc.id] ? 'Edit' : 'Add'} Document Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <FormField label="Document Number">
                                    <input
                                      type="text"
                                      value={documentDetailsForm.document_number || ''}
                                      onChange={(e) => setDocumentDetailsForm(prev => ({
                                        ...prev,
                                        document_number: e.target.value
                                      }))}
                                      className="w-full px-3 py-2 border rounded-md"
                                      placeholder="Optional"
                                    />
                                  </FormField>
                                  
                                  <FormField label="Place of Issue">
                                    <input
                                      type="text"
                                      value={documentDetailsForm.place_of_issue || ''}
                                      onChange={(e) => setDocumentDetailsForm(prev => ({
                                        ...prev,
                                        place_of_issue: e.target.value
                                      }))}
                                      className="w-full px-3 py-2 border rounded-md"
                                      placeholder="Optional"
                                    />
                                  </FormField>
                                  
                                  <FormField label="Date of Issue">
                                    <FullDateInput
                                      value={documentDetailsForm.date_of_issue || ''}
                                      onChange={(value) => setDocumentDetailsForm(prev => ({
                                        ...prev,
                                        date_of_issue: value
                                      }))}
                                      className="w-full"
                                      placeholder="Optional"
                                    />
                                  </FormField>
                                  
                                  <FormField label="Expiry Date">
                                    <FullDateInput
                                      value={documentDetailsForm.expiry_date || ''}
                                      onChange={(value) => setDocumentDetailsForm(prev => ({
                                        ...prev,
                                        expiry_date: value
                                      }))}
                                      className="w-full"
                                      placeholder="Optional"
                                    />
                                  </FormField>

                                  {doc.type === 'Driver\'s License' && (
                                    <>
                                      <FormField label="License Type">
                                        <input
                                          type="text"
                                          value={documentDetailsForm.license_type || ''}
                                          onChange={(e) => setDocumentDetailsForm(prev => ({
                                            ...prev,
                                            license_type: e.target.value
                                          }))}
                                          className="w-full px-3 py-2 border rounded-md"
                                          placeholder="Optional"
                                        />
                                      </FormField>
                                      
                                      <FormField label="License Category">
                                        <input
                                          type="text"
                                          value={documentDetailsForm.license_category || ''}
                                          onChange={(e) => setDocumentDetailsForm(prev => ({
                                            ...prev,
                                            license_category: e.target.value
                                          }))}
                                          className="w-full px-3 py-2 border rounded-md"
                                          placeholder="Optional"
                                        />
                                      </FormField>
                                    </>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() => {
                                      setEditingDocumentId(null);
                                      setDocumentDetailsForm({});
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveDetails}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                  >
                                    Save Details
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Image Preview Modal */}
                {showPreview && previewData && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
                      <div className="flex justify-between items-center mb-2">
                        <button
                          onClick={async () => {
                            try {
                              // Extract just the file path from the URL
                              const filePath = previewData.url.split('/student-documents/')[1];
                              if (!filePath) throw new Error('Invalid file path');

                              const { data, error } = await supabase.storage
                                .from('student-documents')
                                .download(filePath);
                              
                              if (error) throw error;
                              
                              // Create download link
                              const url = URL.createObjectURL(data);
                              const link = document.createElement('a');
                              link.href = url;
                              // Use the original file name from the document record
                              const doc = documents.find(d => d.file_url === filePath);
                              link.download = doc?.file_name || 'document';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error('Error downloading file:', err);
                              alert('Failed to download file. Please try again later.');
                            }
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setShowPreview(false);
                            setPreviewData(null);
                            setPageNumber(1);
                            setNumPages(null);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      {previewData.type === 'image' ? (
                        <img
                          src={previewData.url}
                          alt="Document Preview"
                          className="max-w-full h-auto"
                        />
                      ) : (
                        <div>
                          <Document
                            file={previewData.url}
                            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                            className="max-w-full"
                          >
                            <Page
                              pageNumber={pageNumber}
                              width={800}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                            />
                          </Document>
                          {numPages && numPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                              <button
                                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                disabled={pageNumber <= 1}
                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                              >
                                Previous
                              </button>
                              <span>
                                Page {pageNumber} of {numPages}
                              </span>
                              <button
                                onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                                disabled={pageNumber >= numPages}
                                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};