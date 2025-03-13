/*
  # Add result date to job candidates

  1. Changes
    - Add result_date column to job_candidates table
    - Set result_date to current date for existing records with final status
    - Add check constraint to ensure result_date is set when status is updated

  2. Notes
    - Handles existing data before adding constraint
    - Maintains data integrity
*/

-- First add the column without constraints
ALTER TABLE job_candidates 
ADD COLUMN result_date date;

-- Update existing records that have a final status to use current date
UPDATE job_candidates
SET result_date = CURRENT_DATE
WHERE status IN ('passed', 'failed', 'didnot_participate');

-- Now add the check constraint
ALTER TABLE job_candidates
ADD CONSTRAINT result_date_required_for_status CHECK (
  (status IN ('pending', 'selected') AND result_date IS NULL) OR
  (status IN ('passed', 'failed', 'didnot_participate') AND result_date IS NOT NULL)
);