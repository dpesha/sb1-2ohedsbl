/*
  # Add get_eligible_students function

  1. Function Purpose
    - Determines which students are eligible for a specific job based on:
      a. Student has passed a skill test matching the job category
      b. Student's preferred job category matches the job category
      c. Student's gender matches job's preferred gender (if specified)
      d. Student is not already a candidate for this job

  2. Parameters
    - p_job_id: UUID of the job to check eligibility for

  3. Returns
    - Table of eligible students with their personal info and resume details
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
DECLARE
  v_job_category text;
  v_preferred_gender text;
BEGIN
  -- Get job details
  SELECT category, preferred_gender 
  INTO v_job_category, v_preferred_gender
  FROM jobs 
  WHERE id = p_job_id;

  RETURN QUERY
  SELECT 
    s.id,
    s.personal_info,
    s.resume
  FROM students s
  WHERE EXISTS (
    -- Check if student has passed the relevant skill test
    SELECT 1 
    FROM tests t 
    WHERE t.student_id = s.id 
    AND t.type = 'skill' 
    AND t.skill_category = v_job_category
  )
  AND (s.resume->>'jobCategory')::text = v_job_category
  -- Check gender preference if specified
  AND (
    v_preferred_gender = 'no preference'
    OR (
      v_preferred_gender = 'male only' AND (s.personal_info->>'gender')::text = 'male'
    )
    OR (
      v_preferred_gender = 'female only' AND (s.personal_info->>'gender')::text = 'female'
    )
  )
  -- Exclude students who are already candidates for this job
  AND NOT EXISTS (
    SELECT 1 
    FROM job_candidates jc 
    WHERE jc.job_id = p_job_id 
    AND jc.student_id = s.id
  );
END;
$$;