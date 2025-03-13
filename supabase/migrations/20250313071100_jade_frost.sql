/*
  # Create storage bucket for student documents
  
  1. Changes
    - Create storage bucket for student documents
    - Drop existing policies first to avoid conflicts
    - Recreate storage policies with proper checks
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies from storage.objects table
  DROP POLICY IF EXISTS "Authenticated users can view student documents" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can upload student documents" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can update student documents" ON storage.objects;
  DROP POLICY IF EXISTS "Staff can delete student documents" ON storage.objects;
END $$;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies with proper error handling
DO $$ 
BEGIN
  -- Policy for viewing documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can view student documents'
  ) THEN
    CREATE POLICY "Authenticated users can view student documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'student-documents');
  END IF;

  -- Policy for uploading documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Staff can upload student documents'
  ) THEN
    CREATE POLICY "Staff can upload student documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'student-documents' AND
      (NOT is_student())
    );
  END IF;

  -- Policy for updating documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Staff can update student documents'
  ) THEN
    CREATE POLICY "Staff can update student documents"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'student-documents' AND (NOT is_student()))
    WITH CHECK (bucket_id = 'student-documents' AND (NOT is_student()));
  END IF;

  -- Policy for deleting documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Staff can delete student documents'
  ) THEN
    CREATE POLICY "Staff can delete student documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'student-documents' AND (NOT is_student()));
  END IF;
END $$;