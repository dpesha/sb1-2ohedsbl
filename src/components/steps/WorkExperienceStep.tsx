import React from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';
import { FormField } from '../FormField';
import type { WorkExperience } from '../../types/student';

interface WorkExperienceStepProps {
  data: WorkExperience[];
  onChange: (data: WorkExperience[]) => void;
}

export const WorkExperienceStep: React.FC<WorkExperienceStepProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    onChange([...data, {
      startDate: '',
      endDate: '',
      company: '',
      position: ''
    }]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof WorkExperience, value: string) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {data.map((experience, index) => (
        <div key={index} className="p-6 border rounded-lg bg-gray-50 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <button
              onClick={() => handleRemove(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Start Date">
              <input
                type="date"
                value={experience.startDate}
                onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="End Date">
              <input
                type="date"
                value={experience.endDate}
                onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <FormField label="Company">
            <input
              type="text"
              value={experience.company}
              onChange={(e) => handleChange(index, 'company', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Company Name"
            />
          </FormField>

          <FormField label="Position">
            <input
              type="text"
              value={experience.position}
              onChange={(e) => handleChange(index, 'position', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., Software Engineer"
            />
          </FormField>
        </div>
      ))}

      <button
        onClick={handleAdd}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg
                 text-gray-600 font-medium flex items-center justify-center gap-2
                 hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Add Work Experience
      </button>
    </div>
  );
};