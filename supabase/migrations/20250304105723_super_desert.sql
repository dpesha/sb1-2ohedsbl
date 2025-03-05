/*
  # Fix get_users function return type

  1. Changes
    - Updates the get_users function to match auth.users column types
    - Fixes the type mismatch between varchar and text
    
  2. Security
    - Maintains existing security context
    - Only authenticated users can access
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_users();

-- Recreate the function with correct types
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),
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
      u.email::varchar(255),
      u.created_at,
      u.last_sign_in_at
    FROM auth.users u
    ORDER BY u.created_at DESC;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;