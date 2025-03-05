/*
  # Fix user groups and permissions

  1. Changes
    - Add unique constraint to group names
    - Add function to check if user is in a group
    - Add function to check if user is a student
    - Update RLS policies for better access control
*/

-- Add function to check if user belongs to a specific group
CREATE OR REPLACE FUNCTION is_in_group(group_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_groups ug 
    JOIN groups g ON g.id = ug.group_id 
    WHERE g.name = group_name 
    AND ug.user_id = auth.uid()
  );
END;
$$;

-- Add function specifically for checking student status
CREATE OR REPLACE FUNCTION is_student()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN is_in_group('student');
END;
$$;

-- Update RLS policies for students table
DROP POLICY IF EXISTS "Users can view and modify all students" ON students;
DROP POLICY IF EXISTS "Users can update any student" ON students;

-- Students can only view and update their own records
CREATE POLICY "Students can manage their own records"
ON students
FOR ALL
TO authenticated
USING (
  (is_student() AND auth.uid() = user_id) OR
  (NOT is_student())
)
WITH CHECK (
  (is_student() AND auth.uid() = user_id) OR
  (NOT is_student())
);