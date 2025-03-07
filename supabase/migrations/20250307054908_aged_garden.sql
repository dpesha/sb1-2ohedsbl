/*
  # Add minimum candidates count to jobs table

  1. Changes
    - Add candidates_min_count column to jobs table with default value of 1
    - Add check constraint to ensure candidates_min_count is positive
    - Add check constraint to ensure candidates_min_count <= position_count

  2. Notes
    - Default value of 1 ensures backward compatibility
    - Check constraints maintain data integrity
*/

-- Add candidates_min_count column with constraints
ALTER TABLE jobs 
ADD COLUMN candidates_min_count integer NOT NULL DEFAULT 1;

-- Add check constraint for positive value
ALTER TABLE jobs
ADD CONSTRAINT check_candidates_min_count_positive 
CHECK (candidates_min_count > 0);

-- Add check constraint to ensure min count doesn't exceed position count
ALTER TABLE jobs
ADD CONSTRAINT check_candidates_min_count_less_than_positions
CHECK (candidates_min_count <= position_count);