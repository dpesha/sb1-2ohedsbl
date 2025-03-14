/*
  # Add job documents table

  1. New Tables
    - `job_documents`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `type` (text) - Document type
      - `custom_type` (text, nullable) - Custom type when 'その他' is selected
      - `file_name` (text) - Original file name
      - `file_url` (text) - Storage URL
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `job_documents` table
    - Add policies for staff to manage documents
    - Add policies for students to view documents
*/

-- Create job_documents table
CREATE TABLE IF NOT EXISTS job_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  type text NOT NULL,
  custom_type text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validate document type
  CONSTRAINT valid_document_type CHECK (
    type IN ('求人票', '会社説明', 'その他') AND
    (type = 'その他' AND custom_type IS NOT NULL OR type != 'その他' AND custom_type IS NULL)
  )
);

-- Enable RLS
ALTER TABLE job_documents ENABLE ROW LEVEL SECURITY;

-- Create trigger for updating updated_at
CREATE TRIGGER update_job_documents_updated_at
  BEFORE UPDATE ON job_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add policies
CREATE POLICY "Staff can manage all job documents"
  ON job_documents
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view job documents"
  ON job_documents
  FOR SELECT
  TO authenticated
  USING (is_student());