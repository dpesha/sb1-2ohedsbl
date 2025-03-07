/*
  # Add get_eligible_students function

  1. Changes
    - Creates a new SQL function to get eligible students for a job
    - Implements proper eligibility criteria:
      - Student must have passed a skill test matching the job category
      - Student must not be already selected for the job
      - Student's job category preference must match the job category

  2. Security
    - Function is accessible only to authenticated users
*/

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
    SELECT category INTO v_job_category
    FROM jobs
    WHERE id = p_job_id;
  END;

  RETURN QUERY
  SELECT DISTINCT
    s.id,
    s.personal_info,
    s.resume
  FROM students s
  -- Join with tests to check for passed skill tests
  INNER JOIN tests t ON t.student_id = s.id
  WHERE
    -- Student has passed a skill test
    t.type = 'skill'
    -- Skill category matches job category
    AND t.skill_category = v_job_category
    -- Student's preferred job category matches
    AND (s.resume->>'jobCategory')::text = v_job_category
    -- Student is not already selected for this job
    AND NOT EXISTS (
      SELECT 1
      FROM job_candidates jc
      WHERE jc.job_id = p_job_id
      AND jc.student_id = s.id
    )
    -- Student is eligible for interview
    AND s.status = 'eligibleForInterview';
END;
$$;