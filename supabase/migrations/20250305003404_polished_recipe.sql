/*
  # Create enrollment table and update students table

  1. Changes
    - Create new enrollments table
    - Remove enrollment field from students table
    - Add foreign key constraint
  
  2. Security
    - Enable RLS on enrollments table
    - Add policies for access control
*/

-- Create enrollments table
CREATE TABLE enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  school text NOT NULL,
  class text NOT NULL,
  section text,
  roll_number text,
  start_date text NOT NULL,
  end_date text,
  status text NOT NULL DEFAULT 'learningJapanese',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (
    status IN (
      'learningJapanese',
      'learningSpecificSkill',
      'eligibleForInterview',
      'selectedForJob',
      'jobStarted',
      'dropped'
    )
  )
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students can view their own enrollments"
ON enrollments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = enrollments.student_id
    AND (
      (is_student() AND auth.jwt()->>'email' = s.personal_info->>'email')
      OR (NOT is_student())
    )
  )
);

CREATE POLICY "Staff can manage all enrollments"
ON enrollments
FOR ALL
TO authenticated
USING (NOT is_student())
WITH CHECK (NOT is_student());

-- Create trigger to update updated_at
CREATE TRIGGER update_enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing data
INSERT INTO enrollments (student_id, school, class, section, roll_number, start_date, end_date, status)
SELECT 
  id as student_id,
  enrollment->>'school' as school,
  enrollment->>'class' as class,
  enrollment->>'section' as section,
  enrollment->>'rollNumber' as roll_number,
  enrollment->>'startDate' as start_date,
  enrollment->>'endDate' as end_date,
  enrollment->>'status' as status
FROM students
WHERE enrollment IS NOT NULL
AND enrollment->>'school' IS NOT NULL;

-- Remove enrollment field from students table
ALTER TABLE students DROP COLUMN IF EXISTS enrollment;