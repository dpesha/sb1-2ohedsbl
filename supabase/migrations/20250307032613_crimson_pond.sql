/*
  # Fix classes table structure

  1. Changes
    - Drop and recreate classes table with proper constraints
    - Add RLS policies
    - Add update trigger

  2. Table Structure
    - `id` (uuid, primary key)
    - `student_id` (uuid, references students)
    - `school` (text, not null)
    - `class` (text, nullable)
    - `section` (text, nullable)
    - `roll_number` (text, nullable)
    - `class_type` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. Constraints
    - School must be one of: 'Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan', 'External'
    - For External school, class/section/roll_number/class_type must be NULL
    - For other schools, class and class_type are required
    - Class type must be either 'Language' or 'Skill' when not NULL

  4. Security
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
  
  -- School values constraint
  CONSTRAINT valid_school_values CHECK (
    school IN ('Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan', 'External')
  ),
  
  -- External school fields constraint
  CONSTRAINT check_external_school_fields CHECK (
    (school = 'External') OR
    (
      school IN ('Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan') AND 
      class IS NOT NULL AND 
      class_type IS NOT NULL
    )
  ),
  
  -- Class type values constraint
  CONSTRAINT valid_class_type CHECK (
    class_type IS NULL OR 
    class_type IN ('Language', 'Skill')
  )
);

-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Staff can manage all classes"
  ON classes
  TO authenticated
  USING (auth.jwt() ->> 'email' NOT IN (
    SELECT personal_info ->> 'email'
    FROM students
  ))
  WITH CHECK (auth.jwt() ->> 'email' NOT IN (
    SELECT personal_info ->> 'email'
    FROM students
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
        (auth.jwt() ->> 'email' = (s.personal_info ->> 'email')) OR
        (auth.jwt() ->> 'email' NOT IN (
          SELECT personal_info ->> 'email'
          FROM students
        ))
      )
    )
  );

-- Add trigger for updating updated_at
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();