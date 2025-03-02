import React from 'react';
import { FormField } from '../FormField';
import type { EmergencyContact } from '../../types/student';

interface EmergencyContactStepProps {
  data: EmergencyContact;
  onChange: (data: EmergencyContact) => void;
}

export const EmergencyContactStep: React.FC<EmergencyContactStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof EmergencyContact, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          Please provide contact information for someone we can reach in case of emergency.
        </p>
      </div>

      <FormField label="Full Name">
        <input
          type="text"
          value={data.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="John Doe"
        />
      </FormField>

      <FormField label="Address">
        <input
          type="text"
          value={data.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="123 Main St, City, Country"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone Number">
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="+1 234 567 8900"
          />
        </FormField>

        <FormField label="Email Address">
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="john@example.com"
          />
        </FormField>
      </div>
    </div>
  );
};