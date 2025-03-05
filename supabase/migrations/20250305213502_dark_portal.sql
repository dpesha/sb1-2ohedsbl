/*
  # Add new job status options

  1. Changes
    - Add new status options for jobs:
      - candidates_selected
      - interview_scheduled
    - Update the status check constraint to include new options

  2. Notes
    - Existing statuses are preserved
    - New statuses are added to support interview workflow
*/

DO $$ BEGIN
  -- Update the status check constraint
  ALTER TABLE jobs DROP CONSTRAINT IF EXISTS valid_status;
  
  ALTER TABLE jobs ADD CONSTRAINT valid_status 
    CHECK (status IN (
      'open',
      'filled',
      'cancelled',
      'on_hold',
      'candidates_selected',
      'interview_scheduled'
    ));
END $$;