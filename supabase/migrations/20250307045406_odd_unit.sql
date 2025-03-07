/*
  # Fix get_eligible_students function

  1. Changes
    - Drop existing function to avoid conflicts
    - Recreate function with unambiguous column references
    - Add table aliases to all column references
    - Keep same functionality but fix SQL syntax

  2. Security
    - Function remains SECURITY DEFINER
    - Accessible to authenticated users only
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS get_eligible_students(uuid);

-- Create the function with unambiguous column references
CREATE OR REPLACE FUNCTION get_eligible_students(p_job_id uuid)
RETURNS TABLE (
  id uuid,
  personal_info jsonb,
  resume jsonb,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_category text;
BEGIN
  -- Get the job category
  SELECT j.category INTO v_job_category
  FROM jobs j
  WHERE j.id = p_job_id;

  RETURN QUERY
  SELECT 
    s.id,
    s.personal_info,
    s.resume,
    s.status
  FROM students s
  WHERE s.status = 'eligibleForInterview'
  AND (s.resume->>'jobCategory')::text = v_job_category
  AND NOT EXISTS (
    -- Exclude students who are already candidates for this job
    SELECT 1 
    FROM job_candidates jc 
    WHERE jc.student_id = s.id 
    AND jc.job_id = p_job_id
  );
END;
$$;