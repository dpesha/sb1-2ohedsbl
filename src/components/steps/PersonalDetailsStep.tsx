import React from 'react';
import { FormField } from '../FormField';
import type { PersonalInfo, IdentityDocument, EmergencyContact } from '../../types/student';
import { User, FileText, Phone, AlertCircle } from 'lucide-react';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface PersonalDetailsStepProps {
  personalInfo: PersonalInfo;
  identityDocument: IdentityDocument;
  emergencyContact: EmergencyContact;
  onPersonalInfoChange: (data: PersonalInfo) => void;
  onIdentityDocumentChange: (data: IdentityDocument) => void;
  onEmergencyContactChange: (data: EmergencyContact) => void;
}

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  personalInfo,
  identityDocument,
  emergencyContact,
  onPersonalInfoChange,
  onIdentityDocumentChange,
  onEmergencyContactChange
}) => {
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const validateField = (name: string, value: string): string => {
    if (!value.trim()) {
      return 'This field is required';
    }
    
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (name === 'phone') {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(value)) {
        return 'Please enter a valid phone number';
      }
    }

    return '';
  };

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    const newPersonalInfo = { ...personalInfo, [field]: value };
    onPersonalInfoChange(newPersonalInfo);

    // Validate required fields
    if (['firstName', 'lastName', 'gender', 'dateOfBirth', 'address', 'phone', 'email'].includes(field)) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Required Fields Notice */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">
            Fields marked with * are required
          </p>
        </div>
      </div>

      {/* Personal Information Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <User className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name *" error={errors.firstName}>
              <input
                type="text"
                name="firstName"
                value={personalInfo.firstName}
                onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="Last Name *" error={errors.lastName}>
              <input
                type="text"
                name="lastName"
                value={personalInfo.lastName}
                onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Gender *" error={errors.gender}>
              <select
                name="gender"
                value={personalInfo.gender}
                onChange={(e) => handlePersonalInfoChange('gender', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormField>
            <FormField label="Date of Birth *" error={errors.dateOfBirth}>
              <input
                type="date"
                name="dateOfBirth"
                value={personalInfo.dateOfBirth}
                onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <FormField label="Address *" error={errors.address}>
            <input
              type="text"
              name="address"
              value={personalInfo.address}
              onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone *" error={errors.phone}>
              <input
                type="tel"
                name="phone"
                value={personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="+1 234 567 8900"
              />
            </FormField>
            <FormField label="Email *" error={errors.email}>
              <input
                type="email"
                name="email"
                value={personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="john@example.com"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Religion">
              <input
                type="text"
                name="religion"
                value={personalInfo.religion}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, religion: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="Marital Status">
              <select
                name="maritalStatus"
                value={personalInfo.maritalStatus}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, maritalStatus: e.target.value })}
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
                value={personalInfo.numberOfChildren}
                onChange={(e) => onPersonalInfoChange({ ...personalInfo, numberOfChildren: Number(e.target.value) })}
                min="0"
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Identity Document Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Identity Document</h2>
        </div>

        <div className="space-y-4">
          <FormField label="Document Type">
            <select
              value={identityDocument.documentType}
              onChange={(e) => onIdentityDocumentChange({ ...identityDocument, documentType: e.target.value })}
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
              value={identityDocument.number}
              onChange={(e) => onIdentityDocumentChange({ ...identityDocument, number: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date of Issue">
              <input
                type="date"
                value={identityDocument.dateOfIssue}
                onChange={(e) => onIdentityDocumentChange({ ...identityDocument, dateOfIssue: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
            <FormField label="Expiry Date">
              <input
                type="date"
                value={identityDocument.expiryDate}
                onChange={(e) => onIdentityDocumentChange({ ...identityDocument, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </FormField>
          </div>

          <FormField label="Place of Issue">
            <input
              type="text"
              value={identityDocument.placeOfIssue}
              onChange={(e) => onIdentityDocumentChange({ ...identityDocument, placeOfIssue: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </FormField>
        </div>
      </div>

      {/* Emergency Contact Section */}
      <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b">
          <Phone className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Emergency Contact</h2>
        </div>

        <div className="space-y-4">
          <FormField label="Full Name">
            <input
              type="text"
              value={emergencyContact.name}
              onChange={(e) => onEmergencyContactChange({ ...emergencyContact, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="John Doe"
            />
          </FormField>

          <FormField label="Address">
            <input
              type="text"
              value={emergencyContact.address}
              onChange={(e) => onEmergencyContactChange({ ...emergencyContact, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="123 Main St, City, Country"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number">
              <input
                type="tel"
                value={emergencyContact.phone}
                onChange={(e) => onEmergencyContactChange({ ...emergencyContact, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="+1 234 567 8900"
              />
            </FormField>

            <FormField label="Email Address">
              <input
                type="email"
                value={emergencyContact.email}
                onChange={(e) => onEmergencyContactChange({ ...emergencyContact, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="john@example.com"
              />
            </FormField>
          </div>
        </div>
      </div>
    </div>
  );
};