-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all students" ON students;
DROP POLICY IF EXISTS "Users can create students" ON students;
DROP POLICY IF EXISTS "Users can update their own students" ON students;

-- Create new policies
CREATE POLICY "Users can view and modify all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update any student"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can create students with their user_id"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);