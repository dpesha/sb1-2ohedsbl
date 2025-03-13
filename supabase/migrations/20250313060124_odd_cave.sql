/*
  # Create storage tables for job documents

  1. New Tables
    - `storage_objects`: Stores file metadata and paths
    - `storage_versions`: Stores version history of files
    
  2. Security
    - Enable RLS on storage tables
    - Add policies for staff to manage files
    - Add policies for students to view files
*/

-- Create storage_objects table
CREATE TABLE storage_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  name text NOT NULL,
  owner uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE (bucket_id, name)
);

-- Create storage_versions table
CREATE TABLE storage_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid REFERENCES storage_objects(id) ON DELETE CASCADE,
  version_num integer NOT NULL,
  data bytea NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (object_id, version_num)
);

-- Enable RLS
ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_versions ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_objects
CREATE POLICY "Staff can manage all storage objects"
  ON storage_objects
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view storage objects"
  ON storage_objects
  FOR SELECT
  TO authenticated
  USING (is_student());

-- Create policies for storage_versions
CREATE POLICY "Staff can manage all storage versions"
  ON storage_versions
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view storage versions"
  ON storage_versions
  FOR SELECT
  TO authenticated
  USING (is_student());

-- Create trigger for updating updated_at
CREATE TRIGGER update_storage_objects_updated_at
  BEFORE UPDATE ON storage_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default bucket
INSERT INTO storage_objects (bucket_id, name, metadata)
VALUES ('job-documents', 'job-documents', '{"public": true}'::jsonb)
ON CONFLICT (bucket_id, name) DO NOTHING;