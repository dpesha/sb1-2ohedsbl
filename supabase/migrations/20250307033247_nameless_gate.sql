/*
  # Add class enrollment status trigger

  1. Changes
    - Add trigger function to update student status on class enrollment
    - Add trigger to classes table

  2. Status Updates
    - Language class -> 'learningJapanese'
    - Skill class -> 'learningSpecificSkill'
    - External school -> 'eligibleForInterview'

  3. Security
    - Function is owned by postgres to ensure proper execution
*/

-- Create trigger function
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

-- Add trigger to classes table
DROP TRIGGER IF EXISTS update_student_status_on_enrollment_trigger ON classes;

CREATE TRIGGER update_student_status_on_enrollment_trigger
  AFTER INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_student_status_on_enrollment();