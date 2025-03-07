/*
  # Add status to students and remove from enrollments
  
  1. Changes
    - Add status column to students table with default 'registered'
    - Remove status column from enrollments table
    - Add check constraint for valid status values
    - Migrate existing status values from enrollments to students
  
  2. Security
    - No changes to RLS policies needed
*/

-- Add status to students table
ALTER TABLE students 
ADD COLUMN status text NOT NULL DEFAULT 'registered';

-- Add check constraint for status values
ALTER TABLE students 
ADD CONSTRAINT valid_student_status 
CHECK (status IN (
  'registered',
  'learningJapanese',
  'learningSpecificSkill',
  'eligibleForInterview',
  'selectedForJobInterview',
  'passedInterview',
  'jobStarted',
  'dropped'
));

-- Migrate existing status from enrollments to students
DO $$
BEGIN
  UPDATE students s
  SET status = e.status
  FROM enrollments e
  WHERE s.id = e.student_id;
END $$;

-- Remove status from enrollments table
ALTER TABLE enrollments 
DROP COLUMN status;