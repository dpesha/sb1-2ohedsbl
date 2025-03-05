/*
  # Add interviews table and update job candidates

  1. New Tables
    - `interviews`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `date` (date)
      - `time` (time)
      - `location` (text)
      - `type` (text: online, offline, hybrid)
      - `status` (text: scheduled, completed, cancelled)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add interview_id to job_candidates table
    - Add RLS policies for interviews table

  3. Security
    - Enable RLS on interviews table
    - Add policies for staff to manage interviews
*/

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  location text NOT NULL,
  type text NOT NULL CHECK (type IN ('online', 'offline', 'hybrid')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add interview_id to job_candidates
ALTER TABLE job_candidates
ADD COLUMN interview_id uuid REFERENCES interviews(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can manage all interviews"
ON interviews
TO authenticated
USING (NOT is_student())
WITH CHECK (NOT is_student());

-- Create trigger for updated_at
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();