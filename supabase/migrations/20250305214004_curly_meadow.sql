/*
  # Add job candidates table and functions

  1. New Tables
    - `job_candidates`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `student_id` (uuid, references students)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `job_candidates` table
    - Add policy for staff to manage candidates
*/

-- Create job_candidates table
CREATE TABLE IF NOT EXISTS job_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, student_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_job_candidates_updated_at
  BEFORE UPDATE ON job_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE job_candidates ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Staff can manage job candidates"
  ON job_candidates
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

-- Function to get eligible students for a job
CREATE OR REPLACE FUNCTION get_eligible_students(p_job_id uuid)
RETURNS TABLE (
  id uuid,
  personal_info jsonb,
  resume jsonb,
  enrollment jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.personal_info,
    s.resume,
    e.* AS enrollment
  FROM students s
  LEFT JOIN enrollments e ON s.id = e.student_id
  LEFT JOIN jobs j ON j.id = p_job_id
  WHERE 
    e.status = 'eligibleForInterview'
    AND (s.resume->>'jobCategory')::text = j.category
    AND NOT EXISTS (
      SELECT 1 
      FROM job_candidates jc 
      WHERE jc.job_id = p_job_id 
      AND jc.student_id = s.id
    );
END;
$$ LANGUAGE plpgsql;