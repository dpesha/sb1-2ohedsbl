import React from 'react';
import { FormField } from '../FormField';
import { PersonalInfo } from '../../types/student';

interface PersonalInfoStepProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ data, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name">
          <input
            type="text"
            name="firstName"
            value={data.firstName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
        <FormField label="Last Name">
          <input
            type="text"
            name="lastName"
            value={data.lastName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
      </div>

      <FormField label="Gender">
        <select
          name="gender"
          value={data.gender}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </FormField>

      <FormField label="Date of Birth">
        <input
          type="date"
          name="dateOfBirth"
          value={data.dateOfBirth}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </FormField>

      <FormField label="Address">
        <input
          type="text"
          name="address"
          value={data.address}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Phone">
          <input
            type="tel"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Country">
          <select
            name="country"
            value={data.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Nepal">Nepal</option>
            <option value="India">India</option>
            <option value="Vietnam">Vietnam</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Myanmar">Myanmar</option>
          </select>
        </FormField>
        <FormField label="Languages">
          <input
            type="text"
            name="languages"
            value={data.languages}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Nepali, English, Japanese"
          />
        </FormField>
      </div>

      <FormField label="Religion">
        <input
          type="text"
          name="religion"
          value={data.religion}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Marital Status">
          <select
            name="maritalStatus"
            value={data.maritalStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </FormField>
        <FormField label="Number of Children">
          <input
            type="number"
            name="numberOfChildren"
            value={data.numberOfChildren}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
      </div>
    </div>
  );
};