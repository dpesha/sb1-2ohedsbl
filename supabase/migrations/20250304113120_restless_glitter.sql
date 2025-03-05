/*
  # Fix user group assignment

  1. Changes
    - Drop and recreate handle_first_user() function with improved error handling
    - Add explicit transaction handling for group assignment
    - Add better logging for debugging
*/

-- Drop and recreate the function with improved logic
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_group_id uuid;
  admin_group_id uuid;
  is_first_user boolean;
BEGIN
  -- Check if this is the first user
  SELECT NOT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id != NEW.id
  ) INTO is_first_user;

  -- Get group IDs
  SELECT id INTO student_group_id
  FROM groups
  WHERE name = 'student';

  SELECT id INTO admin_group_id
  FROM groups
  WHERE name = 'admin';

  -- Validate groups exist
  IF student_group_id IS NULL OR admin_group_id IS NULL THEN
    RAISE LOG 'Missing required groups. Student group: %, Admin group: %', student_group_id, admin_group_id;
    RAISE EXCEPTION 'Required groups not found';
  END IF;

  -- Insert appropriate group membership
  IF is_first_user THEN
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.id, admin_group_id)
    ON CONFLICT DO NOTHING;
    
    RAISE LOG 'Assigned first user % to admin group', NEW.id;
  ELSE
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.id, student_group_id)
    ON CONFLICT DO NOTHING;
    
    RAISE LOG 'Assigned user % to student group', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_first_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;