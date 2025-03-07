/*
  # Add enrollment column to students table

  1. Changes
    - Add `enrollment` JSONB column to students table with default empty object
*/

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS enrollment jsonb DEFAULT '{}'::jsonb;