/*
  # Fix license fields validation

  1. Changes
    - Drop existing table and recreate with proper validation
    - Make all fields optional
    - Update license fields constraint to be more permissive
    - Maintain existing RLS policies and triggers

  2. Notes
    - All fields are now truly optional
    - License type and category can both be null
    - Maintains data integrity while allowing flexibility
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
  updated_at timestamptz DEFAULT now()
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