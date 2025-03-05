/*
  # Update clients table RLS policies

  1. Security Changes
    - Remove student access to clients table
    - Allow only staff and admin to manage clients
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Staff can manage all clients" ON clients;
DROP POLICY IF EXISTS "Students can view clients" ON clients;

-- Create new policy for staff and admin
CREATE POLICY "Staff can manage all clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (NOT is_student())
  WITH CHECK (NOT is_student());