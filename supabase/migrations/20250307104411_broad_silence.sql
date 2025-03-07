/*
  # Add interview date to jobs table

  1. Changes
    - Add `interview_date` column to jobs table
    - Column is nullable since not all jobs will have interviews scheduled immediately
*/

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS interview_date date;