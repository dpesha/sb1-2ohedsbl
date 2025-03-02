/*
  # Add updated_at column to students table

  1. Changes
    - Add updated_at column to students table
    - Set default value to now()
    - Add trigger to automatically update the timestamp
*/

-- Add updated_at column
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();