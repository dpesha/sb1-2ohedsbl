/*
  # Create students schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `personal_info` (jsonb)
      - `family_members` (jsonb)
      - `identity_document` (jsonb)
      - `emergency_contact` (jsonb)
      - `education` (jsonb)
      - `work_experience` (jsonb)
      - `certificates` (jsonb)
      - `resume` (jsonb)
      - `enrollment` (jsonb)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `students` table
    - Add policies for authenticated users to:
      - Read their own students
      - Create new students
      - Update their own students
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  personal_info jsonb NOT NULL,
  family_members jsonb DEFAULT '[]'::jsonb,
  identity_document jsonb DEFAULT '{}'::jsonb,
  emergency_contact jsonb DEFAULT '{}'::jsonb,
  education jsonb DEFAULT '[]'::jsonb,
  work_experience jsonb DEFAULT '[]'::jsonb,
  certificates jsonb DEFAULT '[]'::jsonb,
  resume jsonb DEFAULT '{}'::jsonb,
  enrollment jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own students"
  ON students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);