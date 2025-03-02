import React from 'react';
import { Camera } from 'lucide-react';
import { FormField } from '../FormField';
import type { Resume } from '../../types/student';

interface ResumeStepProps {
  data: Resume;
  onChange: (data: Resume) => void;
}

export const ResumeStep: React.FC<ResumeStepProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof Resume, value: string | number) => {
    onChange({
      ...data,
      [field]: field === 'height' || field === 'weight' || field === 'shoeSize'
        ? Number(value)
        : value
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-8 mb-8">
        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <FormField label="First Name (Kana)">
              <input
                type="text"
                value={data.firstNameKana}
                onChange={(e) => handleChange('firstNameKana', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="ファースト"
              />
            </FormField>
            <FormField label="Last Name (Kana)">
              <input
                type="text"
                value={data.lastNameKana}
                onChange={(e) => handleChange('lastNameKana', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="ラスト"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <FormField label="Height (cm)">
              <input
                type="number"
                value={data.height || ''}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.1"
              />
            </FormField>
            <FormField label="Weight (kg)">
              <input
                type="number"
                value={data.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.1"
              />
            </FormField>
            <FormField label="Shoe Size">
              <input
                type="number"
                value={data.shoeSize || ''}
                onChange={(e) => handleChange('shoeSize', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                step="0.5"
              />
            </FormField>
          </div>
        </div>

        <div className="w-48">
          <FormField label="Photo">
            <div className="relative">
              <div className={`
                w-48 h-48 border-2 rounded-lg overflow-hidden
                ${data.photo ? 'border-transparent' : 'border-dashed border-gray-300'}
              `}>
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm">Upload Photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                onChange={handlePhotoChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </FormField>
        </div>
      </div>

      <FormField label="Self Introduction">
        <textarea
          value={data.selfIntroduction}
          onChange={(e) => handleChange('selfIntroduction', e.target.value)}
          className="w-full px-3 py-2 border rounded-md h-32"
          placeholder="Write a brief introduction about yourself..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Strength">
          <textarea
            value={data.strength}
            onChange={(e) => handleChange('strength', e.target.value)}
            className="w-full px-3 py-2 border rounded-md h-24"
            placeholder="Describe your strengths..."
          />
        </FormField>
        <FormField label="Weakness">
          <textarea
            value={data.weakness}
            onChange={(e) => handleChange('weakness', e.target.value)}
            className="w-full px-3 py-2 border rounded-md h-24"
            placeholder="Describe areas for improvement..."
          />
        </FormField>
      </div>

      <FormField label="Hobbies">
        <textarea
          value={data.hobbies}
          onChange={(e) => handleChange('hobbies', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="List your hobbies and interests..."
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Possible Start Date">
          <input
            type="date"
            value={data.possibleStartDate}
            onChange={(e) => handleChange('possibleStartDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </FormField>
        <FormField label="Job Category">
          <select
            value={data.jobCategory}
            onChange={(e) => handleChange('jobCategory', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select Category</option>
            <option value="fullTime">Full Time</option>
            <option value="partTime">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </FormField>
      </div>

      <FormField label="Dietary Restrictions">
        <input
          type="text"
          value={data.dietaryRestriction}
          onChange={(e) => handleChange('dietaryRestriction', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="e.g., Vegetarian, Halal, etc."
        />
      </FormField>
    </div>
  );
};