/*
  # Rename section to batch in classes table

  1. Changes
    - Rename section column to batch in classes table
    - Update constraints to use new column name
    - Maintain existing functionality

  2. Notes
    - Preserves existing data
    - Updates constraints to use new column name
*/

-- Rename section column to batch
ALTER TABLE classes RENAME COLUMN section TO batch;

-- Update the check constraint for external school fields
ALTER TABLE classes DROP CONSTRAINT check_external_school_fields;
ALTER TABLE classes ADD CONSTRAINT check_external_school_fields CHECK (
  (school = 'External') OR
  (
    school IN ('Kings - Kathmandu', 'Kings - Pokhara', 'Hanasakiya - Chitwan') AND 
    class IS NOT NULL AND 
    class_type IS NOT NULL
  )
);