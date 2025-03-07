/*
  # Update classes table schema

  1. Changes
    - Drop and recreate classes table with improved constraints
    - Add RLS policies
    - Add triggers for updated_at and student status updates

  2. Constraints
    - Valid school values
    - Conditional fields based on school type
    - Valid class type values

  3. Security
    - Enable RLS
    - Staff can manage all classes
    - Students can view their own classes
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
    (school = 'External') OR
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
  USING (EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = classes.student_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = classes.student_id
    AND NOT ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
  ));

CREATE POLICY "Students can view their own classes"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = classes.student_id
      AND (
        ((auth.jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text)) OR
        NOT ((auth.jwt() ->> 'email'::text) IN (SELECT (personal_info ->> 'email'::text) FROM students))
      )
    )
  );

-- Add trigger for updating updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for updating student status
CREATE OR REPLACE FUNCTION update_student_status_on_enrollment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student status based on class type and school
  IF NEW.school = 'External' THEN
    UPDATE students 
    SET status = 'eligibleForInterview'
    WHERE id = NEW.student_id;
  ELSIF NEW.class_type = 'Language' THEN
    UPDATE students 
    SET status = 'learningJapanese'
    WHERE id = NEW.student_id;
  ELSIF NEW.class_type = 'Skill' THEN
    UPDATE students 
    SET status = 'learningSpecificSkill'
    WHERE id = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_student_status_on_enrollment_trigger
  AFTER INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_student_status_on_enrollment();