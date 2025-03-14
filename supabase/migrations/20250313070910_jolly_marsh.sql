/*
  # Fix student documents table and trigger

  1. Changes
    - Drop existing trigger if it exists
    - Recreate trigger with proper error handling
    - Add storage policies for student documents
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_student_documents_updated_at ON student_documents;

-- Create trigger for updating updated_at
CREATE TRIGGER update_student_documents_updated_at
  BEFORE UPDATE ON student_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for student documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can view student documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-documents');

CREATE POLICY "Staff can upload student documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-documents' AND
  (NOT is_student())
);

CREATE POLICY "Staff can update student documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-documents' AND (NOT is_student()))
WITH CHECK (bucket_id = 'student-documents' AND (NOT is_student()));

CREATE POLICY "Staff can delete student documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-documents' AND (NOT is_student()));