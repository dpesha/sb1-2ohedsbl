/*
  # Remove minimum candidates validation

  1. Changes
    - Remove check constraint that enforces candidates_min_count <= position_count
    - Keep check constraint for positive value to ensure data integrity

  2. Notes
    - Allows minimum candidates count to be higher than position count
    - Maintains basic data integrity by ensuring positive values
*/

-- Drop the constraint that limits min count to position count
ALTER TABLE jobs
DROP CONSTRAINT IF EXISTS check_candidates_min_count_less_than_positions;