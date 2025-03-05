/*
  # Fix RLS policies for clients, jobs, and interviews

  1. Security
    - Enable RLS on clients, jobs, and interviews tables (if not already enabled)
    - Add policies for:
      - Staff to manage all records
      - Students to view specific records
    - Use DO blocks to check for existing policies

  2. Changes
    - Enable RLS on tables
    - Add policies for staff access
    - Add policies for student access where applicable
*/

-- Enable RLS on tables (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'clients' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'jobs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'interviews' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies for clients table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'clients' 
    AND policyname = 'Staff can manage all clients'
  ) THEN
    CREATE POLICY "Staff can manage all clients"
      ON clients
      FOR ALL
      TO authenticated
      USING (NOT is_student())
      WITH CHECK (NOT is_student());
  END IF;
END $$;

-- Policies for jobs table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'jobs' 
    AND policyname = 'Staff can manage all jobs'
  ) THEN
    CREATE POLICY "Staff can manage all jobs"
      ON jobs
      FOR ALL
      TO authenticated
      USING (NOT is_student())
      WITH CHECK (NOT is_student());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'jobs' 
    AND policyname = 'Students can view jobs'
  ) THEN
    CREATE POLICY "Students can view jobs"
      ON jobs
      FOR SELECT
      TO authenticated
      USING (is_student());
  END IF;
END $$;

-- Policies for interviews table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'interviews' 
    AND policyname = 'Staff can manage all interviews'
  ) THEN
    CREATE POLICY "Staff can manage all interviews"
      ON interviews
      FOR ALL
      TO authenticated
      USING (NOT is_student())
      WITH CHECK (NOT is_student());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'interviews' 
    AND policyname = 'Students can view their own interviews'
  ) THEN
    CREATE POLICY "Students can view their own interviews"
      ON interviews
      FOR SELECT
      TO authenticated
      USING (
        is_student() AND EXISTS (
          SELECT 1 FROM job_candidates jc
          JOIN students s ON s.id = jc.student_id
          WHERE jc.interview_id = interviews.id
          AND s.user_id = auth.uid()
        )
      );
  END IF;
END $$;