/*
  # Enhance trigger logging

  Adds detailed logging to the handle_first_user function to:
  - Log entry and exit points
  - Log all key decision points
  - Log group assignment details
  - Include user email in logs for better tracing
*/

CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bsj_group_id uuid;
BEGIN
  RAISE LOG 'handle_first_user triggered for user % (%)', NEW.id, NEW.email;

  -- Check if user already has group assignments
  IF EXISTS (
    SELECT 1 
    FROM user_groups 
    WHERE user_id = NEW.id
  ) THEN
    RAISE LOG 'User % already has group assignments, skipping', NEW.id;
    RETURN NEW;
  END IF;

  -- Get BSJ group ID
  SELECT id INTO bsj_group_id
  FROM groups
  WHERE name = 'bsj';

  -- Log group lookup result
  IF bsj_group_id IS NULL THEN
    RAISE LOG 'BSJ group not found in groups table';
    RAISE EXCEPTION 'BSJ group not found';
  ELSE
    RAISE LOG 'Found BSJ group with ID: %', bsj_group_id;
  END IF;

  -- Attempt group assignment
  BEGIN
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.id, bsj_group_id);
    
    RAISE LOG 'Successfully assigned user % (%) to BSJ group', NEW.id, NEW.email;
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'User % already in BSJ group (unique violation)', NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error assigning user % to BSJ group: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Unexpected error in handle_first_user for user % (%): %', NEW.id, NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;