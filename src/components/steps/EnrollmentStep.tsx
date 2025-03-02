import React from 'react';
import { School } from 'lucide-react';
import { FormField } from '../FormField';
import type { Enrollment } from '../../types/student';

interface EnrollmentStepProps {
  data: Enrollment;
  onChange: (data: Enrollment) => void;
}

export const EnrollmentStep: React.FC<EnrollmentStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof Enrollment, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 text-blue-800">
          <School className="w-5 h-5" />
          <p className="text-sm font-medium">
            Please provide your enrollment details for the academic program
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="School">
          <input
            type="text"
            value={data.school}
            onChange={(e) => handleChange('school', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="School Name"
          />
        </FormField>

        <FormField label="Class">
          <input
            type="text"
            value={data.class}
            onChange={(e) => handleChange('class', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Grade 10, Year 2"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Section">
          <input
            type="text"
            value={data.section}
            onChange={(e) => handleChange('section', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., A, Science, Commerce"
          />
        </FormField>

        <FormField label="Roll Number">
          <input
            type="text"
            value={data.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Student Roll Number"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date">
          <input
            type="date"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>

        <FormField label="Expected End Date">
          <input
            type="date"
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
      </div>

      <FormField label="Enrollment Status">
        <select
          value={data.status}
          onChange={(e) => handleChange('status', e.target.value as Enrollment['status'])}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="learningJapanese">Learning Japanese</option>
          <option value="learningSpecificSkill">Learning Specific Skill</option>
          <option value="eligibleForInterview">Eligible for Interview</option>
          <option value="selectedForJob">Selected for Job</option>
          <option value="jobStarted">Job Started</option>
          <option value="dropped">Dropped</option>
        </select>
      </FormField>
    </div>
  );
};