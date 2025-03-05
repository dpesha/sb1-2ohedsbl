/*
  # Update student RLS policy to match by email

  1. Changes
    - Modify RLS policy to allow students to only access records where their email matches
    - Non-student users (admin, BSJ, BSI) retain full access
  
  2. Security
    - Students can only view/modify records where their auth email matches student.personal_info->>'email'
    - More secure than user_id matching since it ensures actual user ownership
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Students can manage their own records" ON students;

-- Create new policy using email matching
CREATE POLICY "Students can access records matching their email"
ON students
FOR ALL
TO authenticated
USING (
  (is_student() AND auth.jwt()->>'email' = personal_info->>'email') OR
  (NOT is_student())
)
WITH CHECK (
  (is_student() AND auth.jwt()->>'email' = personal_info->>'email') OR
  (NOT is_student())
);