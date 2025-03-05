/*
  # Fix user signup process

  1. Changes
    - Drop and recreate handle_first_user() function with better error handling
    - Add explicit transaction handling
    - Add better group assignment logic
*/

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_group_id uuid;
BEGIN
  -- Check if user already exists in user_groups
  IF EXISTS (
    SELECT 1 
    FROM user_groups 
    WHERE user_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- Determine which group to assign
  IF NOT EXISTS (
    SELECT 1 
    FROM user_groups 
    LIMIT 1
  ) THEN
    -- First user gets admin group
    SELECT id INTO target_group_id
    FROM groups
    WHERE name = 'admin';
  ELSE
    -- Subsequent users get student group
    SELECT id INTO target_group_id
    FROM groups
    WHERE name = 'student';
  END IF;

  -- Ensure we found a group
  IF target_group_id IS NULL THEN
    RAISE EXCEPTION 'Target group not found';
  END IF;

  -- Insert the user-group relationship
  INSERT INTO user_groups (user_id, group_id)
  VALUES (NEW.id, target_group_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but don't prevent user creation
    RAISE WARNING 'Error in handle_first_user: %', SQLERRM;
    RETURN NEW;
END;
$$;