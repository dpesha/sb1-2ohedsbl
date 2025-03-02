import React from 'react';
import { FormField } from '../FormField';
import type { IdentityDocument } from '../../types/student';

interface IdentityDocumentStepProps {
  data: IdentityDocument;
  onChange: (data: IdentityDocument) => void;
}

export const IdentityDocumentStep: React.FC<IdentityDocumentStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof IdentityDocument, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <FormField label="Document Type">
        <select
          value={data.documentType}
          onChange={(e) => handleChange('documentType', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Select Document Type</option>
          <option value="passport">Passport</option>
          <option value="nationalId">National ID</option>
          <option value="driverLicense">Driver's License</option>
          <option value="birthCertificate">Birth Certificate</option>
        </select>
      </FormField>

      <FormField label="Document Number">
        <input
          type="text"
          value={data.number}
          onChange={(e) => handleChange('number', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Date of Issue">
          <input
            type="date"
            value={data.dateOfIssue}
            onChange={(e) => handleChange('dateOfIssue', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
        <FormField label="Expiry Date">
          <input
            type="date"
            value={data.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
      </div>

      <FormField label="Place of Issue">
        <input
          type="text"
          value={data.placeOfIssue}
          onChange={(e) => handleChange('placeOfIssue', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </FormField>
    </div>
  );
};