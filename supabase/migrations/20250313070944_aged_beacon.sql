/*
  # Add storage policies for student documents
  
  1. Changes
    - Create storage bucket for student documents
    - Add storage policies for access control
    - Skip trigger creation since it already exists
  
  2. Security
    - Only staff can upload/update/delete documents
    - All authenticated users can view documents
*/

-- Create storage bucket for student documents
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