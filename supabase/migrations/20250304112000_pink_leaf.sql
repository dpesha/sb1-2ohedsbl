/*
  # Fix user signup trigger function

  1. Changes
    - Update handle_first_user() function to handle existing users
    - Add check to prevent duplicate group assignments
*/

-- Drop and recreate the function with duplicate check
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this user already has any group assignments
  IF EXISTS (SELECT 1 FROM user_groups WHERE user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_groups LIMIT 1) THEN
    -- First user gets admin group
    INSERT INTO user_groups (user_id, group_id)
    SELECT NEW.id, g.id
    FROM groups g
    WHERE g.name = 'admin'
    ON CONFLICT DO NOTHING;
  ELSE
    -- Subsequent users get student group
    INSERT INTO user_groups (user_id, group_id)
    SELECT NEW.id, g.id
    FROM groups g
    WHERE g.name = 'student'
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;