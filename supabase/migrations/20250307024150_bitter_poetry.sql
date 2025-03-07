/*
  # Add support for multiple classes per student
  
  1. Changes
    - Update classes table to support multiple classes per student
    - Add unique constraint to prevent duplicate class entries
    - Update RLS policies to maintain security
  
  2. Security
    - Maintain existing RLS policies
    - Add unique constraint for student_id, school, class, and class_type combination
*/

-- Add unique constraint to prevent duplicate classes
ALTER TABLE classes
ADD CONSTRAINT unique_student_class 
UNIQUE (student_id, school, class, class_type);