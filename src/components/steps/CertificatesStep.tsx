import React from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { FormField } from '../FormField';
import type { Certificate } from '../../types/student';

interface CertificatesStepProps {
  data: Certificate[];
  onChange: (data: Certificate[]) => void;
}

export const CertificatesStep: React.FC<CertificatesStepProps> = ({ data, onChange }) => {
  const handleAdd = () => {
    onChange([...data, {
      date: '',
      name: ''
    }]);
  };

  const handleRemove = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof Certificate, value: string) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value
    };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium mb-1">No Certificates Added</p>
          <p className="text-sm">Add your professional certificates and achievements</p>
        </div>
      )}

      {data.map((certificate, index) => (
        <div key={index} className="p-6 border rounded-lg bg-gray-50 relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <Award className="w-5 h-5 text-blue-500" />
            <button
              onClick={() => handleRemove(index)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date Received">
              <input
                type="date"
                value={certificate.date}
                onChange={(e) => handleChange(index, 'date', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>

            <FormField label="Certificate Name">
              <input
                type="text"
                value={certificate.name}
                onChange={(e) => handleChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., AWS Certified Solutions Architect"
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
        Add Certificate
      </button>
    </div>
  );
};