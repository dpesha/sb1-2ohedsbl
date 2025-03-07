/*
  # Update get_eligible_students function

  1. Changes
    - Removes redundant skill test check since student status already indicates eligibility
    - Simplifies eligibility criteria:
      - Student must be in 'eligibleForInterview' status
      - Student's job category preference must match the job category
      - Student must not be already selected for the job

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
  CROSS JOIN job_category j
  WHERE
    -- Student is eligible for interview
    s.status = 'eligibleForInterview'
    -- Student's preferred job category matches
    AND (s.resume->>'jobCategory')::text = j.category
    -- Student is not already selected for this job
    AND NOT EXISTS (
      SELECT 1
      FROM job_candidates jc
      WHERE jc.job_id = p_job_id
      AND jc.student_id = s.id
    );
$$;