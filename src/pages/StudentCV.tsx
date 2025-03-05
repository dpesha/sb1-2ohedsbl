import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { JapaneseCV } from '../components/JapaneseCV';
import { useStudents } from '../contexts/StudentContext';

export const StudentCV: React.FC = () => {
  const { id } = useParams();
  const { students, loading, error } = useStudents();
  const student = students.find(s => s.id === id);

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
          <p className="mb-2">Error loading student CV</p>
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
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gradient-blue text-white rounded-md hover:opacity-90 transition-opacity"
          >
            Print CV
          </button>
        </div>
        
        <JapaneseCV student={student} />
      </div>
    </div>
  );
};