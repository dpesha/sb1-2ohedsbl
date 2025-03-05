/*
  # Fix users access with secure function

  1. Changes
    - Drops the previous users view
    - Creates a secure function to fetch user data
    - Adds proper security context
    
  2. Security
    - Function runs with security definer
    - Only authenticated users can access
    - Returns limited user information
*/

-- Drop the previous view if it exists
DROP VIEW IF EXISTS users;

-- Create a secure function to fetch users
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only allow authenticated users
  IF auth.role() = 'authenticated' THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email,
      u.created_at,
      u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;