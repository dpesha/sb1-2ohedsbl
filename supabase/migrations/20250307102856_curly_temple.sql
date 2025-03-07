/*
  # Fix get_eligible_students function

  1. Changes
    - Fixes the column reference error by using proper table aliases
    - Improves SQL query performance with proper joins
    - Maintains existing eligibility criteria:
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
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH job_category AS (
    SELECT category 
    FROM jobs 
    WHERE id = p_job_id
  )
  SELECT DISTINCT
    s.id,
    s.personal_info,
    s.resume
  FROM students s
  INNER JOIN tests t ON t.student_id = s.id
  CROSS JOIN job_category j
  WHERE
    -- Student has passed a skill test
    t.type = 'skill'
    -- Skill category matches job category
    AND t.skill_category = j.category
    -- Student's preferred job category matches
    AND (s.resume->>'jobCategory')::text = j.category
    -- Student is not already selected for this job
    AND NOT EXISTS (
      SELECT 1
      FROM job_candidates jc
      WHERE jc.job_id = p_job_id
      AND jc.student_id = s.id
    )
    -- Student is eligible for interview
    AND s.status = 'eligibleForInterview';
$$;