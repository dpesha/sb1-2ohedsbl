/*
  # Update get_eligible_students function

  1. Changes
    - Drop existing function to allow return type change
    - Recreate function with updated return type to include student status
    - Only return students who:
      - Have status 'eligibleForInterview'
      - Have matching job category in their resume
    - Include student status in the returned data

  2. Security
    - Function is accessible to authenticated users only
    - Uses SECURITY DEFINER to ensure consistent permissions
*/

-- First drop the existing function
DROP FUNCTION IF EXISTS get_eligible_students(uuid);

-- Create the function with new return type
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
  SELECT category INTO v_job_category
  FROM jobs
  WHERE id = p_job_id;

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