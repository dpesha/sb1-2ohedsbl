/*
  # Create student documents table

  1. New Tables
    - `student_documents`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `type` (text)
      - `custom_type` (text, nullable)
      - `file_name` (text)
      - `file_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Staff can manage all documents
    - Students can view their own documents

  3. Constraints
    - Valid document types
    - Custom type required for 'その他' (Other) type
*/

-- Create student_documents table
CREATE TABLE IF NOT EXISTS student_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  type text NOT NULL,
  custom_type text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validate document type
  CONSTRAINT valid_document_type CHECK (
    type IN ('Photos', 'Passport', 'Driver''s License', 'その他') AND
    (type = 'その他' AND custom_type IS NOT NULL OR type != 'その他' AND custom_type IS NULL)
  )
);

-- Enable RLS
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_student_documents_updated_at
  BEFORE UPDATE ON student_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add policies
CREATE POLICY "Staff can manage all student documents"
  ON student_documents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_documents.student_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = student_documents.student_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ));

CREATE POLICY "Students can view their own documents"
  ON student_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = student_documents.student_id
      AND (
        ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text)) OR
        NOT ((auth.jwt() ->> 'email'::text) IN (SELECT (personal_info ->> 'email'::text) FROM students))
      )
    )
  );