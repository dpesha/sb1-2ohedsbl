/*
  # Add existing users to admin group
  
  This migration adds all existing users to the admin group to ensure they have full access.
  This is a one-time migration to set up initial admin users.
*/

-- Insert admin group membership for all existing users
INSERT INTO user_groups (user_id, group_id)
SELECT 
  u.id as user_id,
  g.id as group_id
FROM auth.users u
CROSS JOIN groups g
WHERE g.name = 'admin'
AND NOT EXISTS (
  SELECT 1 
  FROM user_groups ug 
  WHERE ug.user_id = u.id 
  AND ug.group_id = g.id
);