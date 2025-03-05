/*
  # Update RLS policies for students table

  1. Changes
    - Remove user_id restriction from SELECT policy
    - Keep user_id restrictions for INSERT and UPDATE policies
    - This allows all authenticated users to view all students while only allowing users to modify their own records

  2. Security
    - All authenticated users can view all students
    - Users can only create/update their own student records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own students" ON students;
DROP POLICY IF EXISTS "Users can create students" ON students;
DROP POLICY IF EXISTS "Users can update their own students" ON students;

-- Create new policies
CREATE POLICY "Users can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);