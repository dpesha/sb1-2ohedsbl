/*
  # Add preferred gender field to jobs table

  1. Changes
    - Add preferred_gender field to jobs table
    - Add check constraint to ensure valid values
    - Set default value to 'no preference'

  2. Notes
    - Values can be: 'no preference', 'male only', 'female only'
    - Default value is 'no preference'
*/

ALTER TABLE jobs
ADD COLUMN preferred_gender text NOT NULL DEFAULT 'no preference';

ALTER TABLE jobs
ADD CONSTRAINT valid_preferred_gender
CHECK (preferred_gender IN ('no preference', 'male only', 'female only'));