/*
  # Add result date to job candidates

  1. Changes
    - Add result_date column to job_candidates table
    - Default to NULL since result date is only set when interview result is recorded
    - Add check constraint to ensure result_date is set when status is updated
*/

ALTER TABLE job_candidates 
ADD COLUMN result_date date;

-- Add check constraint to ensure result_date is set when status is updated
ALTER TABLE job_candidates
ADD CONSTRAINT result_date_required_for_status CHECK (
  (status IN ('pending', 'selected') AND result_date IS NULL) OR
  (status IN ('passed', 'failed', 'didnot_participate') AND result_date IS NOT NULL)
);