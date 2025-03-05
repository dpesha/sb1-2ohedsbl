/*
  # Add country and languages fields

  1. Changes
    - Add default values for country and languages fields in personal_info
    - Update existing records with default values
*/

DO $$ 
BEGIN
  -- Update existing records to include country and languages fields with default values
  UPDATE students 
  SET personal_info = personal_info || 
    jsonb_build_object(
      'country', COALESCE((personal_info->>'country'), 'Nepal'),
      'languages', COALESCE((personal_info->>'languages'), '')
    );
END $$;