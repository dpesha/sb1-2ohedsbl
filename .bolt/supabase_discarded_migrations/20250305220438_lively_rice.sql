/*
  # Add RLS policies for clients, jobs, and interviews

  1. Security
    - Enable RLS on clients, jobs, and interviews tables
    - Add policies for:
      - Staff to manage all records
      - Students to view specific records

  2. Changes
    - Enable RLS on tables
    - Add policies for staff access
    - Add policies for student access where applicable
*/

-- Enable RLS on tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Staff can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

-- Policies for jobs table
CREATE POLICY "Staff can manage all jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (is_student());

-- Policies for interviews table
CREATE POLICY "Staff can manage all interviews"
  ON interviews
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view their own interviews"
  ON interviews
  FOR SELECT
  TO authenticated
  USING (
    is_student() AND EXISTS (
      SELECT 1 FROM job_candidates jc
      JOIN students s ON s.id = jc.student_id
      WHERE jc.interview_id = interviews.id
      AND s.user_id = auth.uid()
    )
  );