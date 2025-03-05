/*
  # Fix get_eligible_students function

  1. Changes
    - Update return type to match the actual structure needed by the UI
    - Fix column selection and type casting
    - Ensure proper JSON structure for nested objects

  2. Notes
    - Function returns students eligible for a specific job based on:
      - Student status is 'eligibleForInterview'
      - Job category matches student's preferred category
      - Student is not already selected for this job
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_eligible_students;

-- Create the fixed function
CREATE OR REPLACE FUNCTION get_eligible_students(p_job_id uuid)
RETURNS TABLE (
  id uuid,
  personal_info jsonb,
  resume jsonb,
  enrollment jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.personal_info,
    s.resume,
    jsonb_build_object(
      'school', e.school,
      'class', e.class,
      'status', e.status
    ) AS enrollment
  FROM students s
  JOIN enrollments e ON s.id = e.student_id
  JOIN jobs j ON j.id = p_job_id
  WHERE 
    e.status = 'eligibleForInterview'
    AND (s.resume->>'jobCategory')::text = j.category
    AND NOT EXISTS (
      SELECT 1 
      FROM job_candidates jc 
      WHERE jc.job_id = p_job_id 
      AND jc.student_id = s.id
    );
END;
$$ LANGUAGE plpgsql;