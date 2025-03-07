/*
  # Rename enrollment to class and add class type
  
  1. Changes
    - Rename enrollments table to classes
    - Add class_type column with values 'Language' or 'Skill'
    - Update foreign key references
    - Add check constraint for class_type values
  
  2. Security
    - Migrate existing RLS policies to new table name
*/

-- Rename table
ALTER TABLE enrollments RENAME TO classes;

-- Add class_type column
ALTER TABLE classes 
ADD COLUMN class_type text NOT NULL DEFAULT 'Language';

-- Add check constraint for class_type values
ALTER TABLE classes 
ADD CONSTRAINT valid_class_type 
CHECK (class_type IN ('Language', 'Skill'));

-- Update foreign key references
ALTER TABLE classes
RENAME CONSTRAINT enrollments_student_id_fkey TO classes_student_id_fkey;

-- Update RLS policies
ALTER POLICY "Staff can manage all enrollments" ON classes
RENAME TO "Staff can manage all classes";

ALTER POLICY "Students can view their own enrollments" ON classes
RENAME TO "Students can view their own classes";