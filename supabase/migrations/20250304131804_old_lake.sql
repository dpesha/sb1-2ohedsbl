/*
  # Simplify user group assignment

  Updates the handle_first_user function to:
  - Remove first user check
  - Always assign new users to 'bsj' group
  - Improve error handling and logging
*/

-- Drop and recreate the function with simplified logic
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bsj_group_id uuid;
BEGIN
  -- Check if user already has group assignments
  IF EXISTS (
    SELECT 1 
    FROM user_groups 
    WHERE user_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get BSJ group ID
  SELECT id INTO bsj_group_id
  FROM groups
  WHERE name = 'bsj';

  -- Validate group exists
  IF bsj_group_id IS NULL THEN
    RAISE LOG 'BSJ group not found';
    RAISE EXCEPTION 'BSJ group not found';
  END IF;

  -- Assign user to BSJ group
  INSERT INTO user_groups (user_id, group_id)
  VALUES (NEW.id, bsj_group_id)
  ON CONFLICT DO NOTHING;
  
  RAISE LOG 'Assigned user % to BSJ group', NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_first_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;