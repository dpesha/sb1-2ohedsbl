/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `accepting_organization` (text)
      - `work_location` (text)
      - `category` (text)
      - `position_count` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for staff to manage all jobs
    - Prevent students from accessing jobs table

  3. Constraints
    - Foreign key to clients table
    - Status validation using CHECK constraint
*/

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  accepting_organization text NOT NULL,
  work_location text NOT NULL,
  category text NOT NULL,
  position_count integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validate status values
  CONSTRAINT valid_status CHECK (status IN ('open', 'filled', 'cancelled', 'on_hold'))
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for staff to manage all jobs
CREATE POLICY "Staff can manage all jobs"
  ON jobs
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

-- Create trigger for updating updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();