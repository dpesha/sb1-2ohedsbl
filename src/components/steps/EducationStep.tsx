import React from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { FormField } from '../FormField';
import { DateInput } from '../DateInput';
import type { Education } from '../../types/student';

interface EducationStepProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    onChange([...data, {
      startDate: '',
      endDate: '',
      institution: '',
      degree: '',
      fieldOfStudy: ''
    }]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Education, value: string) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {data.map((education, index) => (
        <div key={index} className="p-6 border rounded-lg bg-gray-50 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            <button
              onClick={() => handleRemove(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Start Date">
              <DateInput
                value={education.startDate}
                onChange={(value) => handleChange(index, 'startDate', value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="End Date">
              <DateInput
                value={education.endDate}
                onChange={(value) => handleChange(index, 'endDate', value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <FormField label="Institution">
            <input
              type="text"
              value={education.institution}
              onChange={(e) => handleChange(index, 'institution', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="University/School Name"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <FormField label="Degree">
              <select
                value={education.degree}
                onChange={(e) => handleChange(index, 'degree', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Degree</option>
                <option value="highSchool">High School</option>
                <option value="associate">Associate's Degree</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="doctorate">Doctorate</option>
                <option value="other">Other</option>
              </select>
            </FormField>

            <FormField label="Field of Study">
              <input
                type="text"
                value={education.fieldOfStudy}
                onChange={(e) => handleChange(index, 'fieldOfStudy', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Computer Science"
              />
            </FormField>
          </div>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg
                 text-gray-600 font-medium flex items-center justify-center gap-2
                 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Education
      </button>
    </div>
  );
};