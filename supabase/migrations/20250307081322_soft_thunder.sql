/*
  # Add tests table for tracking student test results

  1. New Tables
    - `tests`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `type` (text) - either 'jft_basic_a2' or 'skill'
      - `skill_category` (text, nullable) - only for skill tests
      - `passed_date` (text) - stored as YYYY-MM
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `tests` table
    - Add policies for staff to manage tests
    - Add policies for students to view their own tests
*/

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type text NOT NULL,
  skill_category text,
  passed_date text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_test_type CHECK (type IN ('jft_basic_a2', 'skill')),
  CONSTRAINT valid_skill_category CHECK (
    (type = 'skill' AND skill_category IN ('介護', '宿泊', '外食', '建設', '農業', 'ドライバー', 'ビルクリーニング', 'グラウンドハンドリング')) OR
    (type = 'jft_basic_a2' AND skill_category IS NULL)
  )
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Staff can manage all tests"
  ON tests
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());

CREATE POLICY "Students can view their own tests"
  ON tests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      WHERE s.id = tests.student_id
      AND ((jwt() ->> 'email'::text) = (s.personal_info ->> 'email'::text))
    )
  );