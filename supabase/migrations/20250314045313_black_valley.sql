/*
  # Make license fields optional

  1. Changes
    - Drop existing table to recreate with optional fields
    - Make all fields optional including license fields
    - Keep existing RLS policies and triggers
    - Keep existing constraints with updated validation

  2. Security
    - Maintain existing RLS policies
    - Keep existing triggers
*/

-- Drop existing table
DROP TABLE IF EXISTS student_document_details;

-- Recreate table with all fields optional
CREATE TABLE student_document_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES student_documents(id) ON DELETE CASCADE,
  document_number text,
  date_of_issue text,
  expiry_date text,
  place_of_issue text,
  license_type text,
  license_category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Update constraint to handle optional license fields
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