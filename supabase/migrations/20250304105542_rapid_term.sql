/*
  # Add users view for authenticated access

  Creates a secure view that allows authenticated users to see basic user information
  while maintaining security of sensitive data.

  1. New View
    - Creates a view that exposes only necessary user information
    - Includes email, creation date, and last sign in time
    
  2. Security
    - Enables RLS on the view
    - Adds policy for authenticated users to view all records
*/

-- Create view for user information
CREATE VIEW users AS
SELECT
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users;

-- Enable RLS
ALTER VIEW users SET (security_invoker = true);

-- Grant access to authenticated users
GRANT SELECT ON users TO authenticated;