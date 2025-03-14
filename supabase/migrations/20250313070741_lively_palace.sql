/*
  # Fix job_candidates result_date column

  1. Changes
    - Drop existing result_date column if it exists
    - Add result_date column with proper constraints
    - Update existing records with current date for final statuses
    - Add check constraint for status-date relationship

  2. Notes
    - Handles case where column may already exist
    - Maintains data consistency
    - Ensures proper validation of status and date relationship
*/

-- First drop the column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'job_candidates' 
    AND column_name = 'result_date'
  ) THEN
    ALTER TABLE job_candidates DROP COLUMN result_date;
  END IF;
END $$;

-- Add the column without constraints
ALTER TABLE job_candidates 
ADD COLUMN result_date date;

-- Update existing records that have a final status to use current date
UPDATE job_candidates
SET result_date = CURRENT_DATE
WHERE status IN ('passed', 'failed', 'didnot_participate')
AND result_date IS NULL;

-- Add the check constraint
ALTER TABLE job_candidates
ADD CONSTRAINT result_date_required_for_status CHECK (
  (status IN ('pending', 'selected') AND result_date IS NULL) OR
  (status IN ('passed', 'failed', 'didnot_participate') AND result_date IS NOT NULL)
);