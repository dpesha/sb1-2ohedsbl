/*
  # Fix country field handling

  1. Changes
    - Add a check constraint to ensure country field is always present in personal_info
    - Update any existing records that might have null or missing country values
    - Set default country to 'Nepal' if not specified

  2. Security
    - No changes to RLS policies required
*/

-- First ensure all existing records have a country field
UPDATE students 
SET personal_info = personal_info || 
  jsonb_build_object(
    'country', 
    CASE 
      WHEN personal_info->>'country' IS NULL THEN 'Nepal'
      WHEN personal_info->>'country' = '' THEN 'Nepal'
      ELSE personal_info->>'country'
    END
  )
WHERE personal_info->>'country' IS NULL 
   OR personal_info->>'country' = '';

-- Add check constraint to ensure country is always present
ALTER TABLE students
ADD CONSTRAINT check_personal_info_country
CHECK (
  (personal_info->>'country') IS NOT NULL 
  AND (personal_info->>'country')::text != ''
);