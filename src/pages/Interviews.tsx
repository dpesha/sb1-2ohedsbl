import React from 'react';
import { Calendar } from 'lucide-react';

export const Interviews: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500 text-center">Interview scheduling coming soon</p>
        </div>
      </div>
    </div>
  );
};