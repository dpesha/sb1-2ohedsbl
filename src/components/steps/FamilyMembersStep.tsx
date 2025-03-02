import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FormField } from '../FormField';
import type { FamilyMember } from '../../types/student';

interface FamilyMembersStepProps {
  data: FamilyMember[];
  onChange: (data: FamilyMember[]) => void;
}

export const FamilyMembersStep: React.FC<FamilyMembersStepProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    onChange([...data, {
      name: '',
      gender: 'male',
      age: 0,
      relationship: '',
      job: ''
    }]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof FamilyMember, value: string | number) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: field === 'age' ? Number(value) : value
    };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {data.map((member, index) => (
        <div key={index} className="p-4 border rounded-lg bg-gray-50 relative">
          <button
            onClick={() => handleRemove(index)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="Name">
              <input
                type="text"
                value={member.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="Age">
              <input
                type="number"
                value={member.age}
                onChange={(e) => handleChange(index, 'age', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Gender">
              <select
                value={member.gender}
                onChange={(e) => handleChange(index, 'gender', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Relationship">
              <input
                type="text"
                value={member.relationship}
                onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="Job">
              <input
                type="text"
                value={member.job}
                onChange={(e) => handleChange(index, 'job', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
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
        Add Family Member
      </button>
    </div>
  );
};