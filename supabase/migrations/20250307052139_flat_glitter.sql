/*
  # Remove interviews functionality and update statuses

  1. Changes
    - First update existing job statuses to valid values
    - Drop interviews table and related objects
    - Remove interview_id from job_candidates
    - Update job status values to remove interview-related statuses
    - Update student status values to remove interview-related statuses

  2. Data Preservation
    - Update existing job statuses before modifying constraints
    - Drop policies and constraints in correct order
    - Maintain data consistency throughout changes
*/

-- First update any jobs with 'interview_scheduled' status to 'candidates_selected'
UPDATE jobs 
SET status = 'candidates_selected'
WHERE status = 'interview_scheduled';

-- Drop policies that depend on the tables
DROP POLICY IF EXISTS "Students can view their own interviews" ON interviews;
DROP POLICY IF EXISTS "Staff can manage all interviews" ON interviews;

-- Drop foreign key constraints
ALTER TABLE job_candidates DROP CONSTRAINT IF EXISTS job_candidates_interview_id_fkey;

-- Remove interview_id from job_candidates
ALTER TABLE job_candidates DROP COLUMN IF EXISTS interview_id;

-- Drop the interviews table
DROP TABLE IF EXISTS interviews;

-- Update job status enum
ALTER TABLE jobs 
  DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE jobs
  ADD CONSTRAINT valid_status 
  CHECK (status = ANY (ARRAY[
    'open'::text,
    'filled'::text,
    'cancelled'::text,
    'on_hold'::text,
    'candidates_selected'::text
  ]));

-- Update student status enum
ALTER TABLE students 
  DROP CONSTRAINT IF EXISTS valid_student_status;

ALTER TABLE students
  ADD CONSTRAINT valid_student_status 
  CHECK (status = ANY (ARRAY[
    'registered'::text,
    'learningJapanese'::text,
    'learningSpecificSkill'::text,
    'eligibleForInterview'::text,
    'selectedForJob'::text,
    'jobStarted'::text,
    'dropped'::text
  ]));