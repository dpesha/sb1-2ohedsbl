/*
  # Create Supabase Storage bucket and policies

  1. New Storage Bucket
    - Create 'job-documents' bucket for storing job-related files
    - Enable public access for the bucket
    - Set up RLS policies for access control

  2. Security
    - Staff can manage all files
    - Students can only view files
*/

-- Enable storage by creating the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the job-documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-documents', 'job-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to select all files
CREATE POLICY "Authenticated users can view all files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'job-documents');

-- Create policy to allow staff to insert files
CREATE POLICY "Staff can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'job-documents' AND
  (NOT is_student())
);

-- Create policy to allow staff to update files
CREATE POLICY "Staff can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'job-documents' AND (NOT is_student()))
WITH CHECK (bucket_id = 'job-documents' AND (NOT is_student()));

-- Create policy to allow staff to delete files
CREATE POLICY "Staff can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'job-documents' AND (NOT is_student()));