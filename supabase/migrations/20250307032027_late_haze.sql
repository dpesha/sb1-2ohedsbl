/*
  # Fix classes table with correct auth function

  1. Changes
    - Drop existing classes table
    - Create new classes table with updated structure
    - Add constraints and policies with correct auth.jwt() function
    - Remove start_date and end_date columns
    - Add validation for External school entries

  2. Security
    - Enable RLS
    - Add policies for staff and students using auth.jwt()
*/

-- Drop existing table
DROP TABLE IF EXISTS classes;

-- Create new table
CREATE TABLE classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  school text NOT NULL,
  class text,
  section text,
  roll_number text,
  class_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_school_values CHECK (
    school IN ('Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan', 'External')
  ),
  CONSTRAINT check_external_school_fields CHECK (
    (school = 'External' AND class IS NULL AND section IS NULL AND roll_number IS NULL AND class_type IS NULL) OR
    (school IN ('Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan') AND class IS NOT NULL AND class_type IS NOT NULL)
  ),
  CONSTRAINT valid_class_type CHECK (
    class_type IS NULL OR class_type IN ('Language', 'Skill')
  )
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Staff can manage all classes"
  ON classes
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view their own classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = classes.student_id
      AND (
        (is_student() AND (auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
        OR (NOT is_student())
      )
    )
  );

-- Add trigger for updating updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();