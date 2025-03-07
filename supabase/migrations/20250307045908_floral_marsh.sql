/*
  # Fix get_eligible_students function

  1. Changes
    - Fix ambiguous id column reference by properly qualifying table names
    - Update return columns to match current schema
    - Add proper table aliases
    - Improve query performance with explicit column selection
*/

DROP FUNCTION IF EXISTS get_eligible_students(uuid);

CREATE OR REPLACE FUNCTION get_eligible_students(p_job_id uuid)
RETURNS TABLE (
  id uuid,
  personal_info jsonb,
  resume jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Get the job category
  DECLARE
    v_job_category text;
  BEGIN
    SELECT j.category INTO v_job_category
    FROM jobs j
    WHERE j.id = p_job_id;

    RETURN QUERY
    SELECT 
      s.id,
      s.personal_info,
      s.resume
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
END;
$$;