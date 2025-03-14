/*
  # Add document details table

  1. New Tables
    - `student_document_details`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references student_documents)
      - `document_number` (text)
      - `date_of_issue` (text)
      - `expiry_date` (text)
      - `place_of_issue` (text)
      - `license_type` (text, nullable)
      - `license_category` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for staff and students
*/

-- Create document details table
CREATE TABLE student_document_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES student_documents(id) ON DELETE CASCADE,
  document_number text NOT NULL,
  date_of_issue text NOT NULL,
  expiry_date text NOT NULL,
  place_of_issue text NOT NULL,
  license_type text,
  license_category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint for license fields
  CONSTRAINT valid_license_fields CHECK (
    (license_type IS NULL AND license_category IS NULL) OR
    (license_type IS NOT NULL AND license_category IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE student_document_details ENABLE ROW LEVEL SECURITY;

-- Add trigger for updating updated_at
CREATE TRIGGER update_student_document_details_updated_at
  BEFORE UPDATE ON student_document_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add policies
CREATE POLICY "Staff can manage all document details"
  ON student_document_details
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 
    FROM student_documents sd
    JOIN students s ON s.id = sd.student_id
    WHERE sd.id = student_document_details.document_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 
    FROM student_documents sd
    JOIN students s ON s.id = sd.student_id
    WHERE sd.id = student_document_details.document_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ));

CREATE POLICY "Students can view their own document details"
  ON student_document_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM student_documents sd
      JOIN students s ON s.id = sd.student_id
      WHERE sd.id = student_document_details.document_id
      AND (
        ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text)) OR
        NOT ((auth.jwt() ->> 'email'::text) IN (SELECT (personal_info ->> 'email'::text) FROM students))
      )
    )
  );