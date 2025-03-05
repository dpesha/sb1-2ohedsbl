/*
  # Verify and set correct permissions

  1. Revoke and reset function permissions
  2. Verify trigger permissions
  3. Grant necessary table access
*/

-- First, revoke all permissions from the function
REVOKE ALL ON FUNCTION handle_first_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION handle_first_user() FROM authenticated;
REVOKE ALL ON FUNCTION handle_first_user() FROM anon;

-- Grant execute permission to the trigger owner (postgres)
GRANT EXECUTE ON FUNCTION handle_first_user() TO postgres;

-- Verify trigger permissions
DO $$
BEGIN
  -- Drop and recreate the trigger to ensure proper ownership
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_first_user();
END $$;

-- Grant necessary table permissions
GRANT SELECT ON groups TO postgres;
GRANT INSERT, SELECT ON user_groups TO postgres;

-- Add logging for trigger execution
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bsj_group_id uuid;
BEGIN
  -- Enhanced logging
  RAISE LOG 'handle_first_user executing for user % (%) with role %', 
    NEW.id, 
    NEW.email,
    current_user;

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

  -- Attempt group assignment with role logging
  BEGIN
    RAISE LOG 'Attempting to insert user_group with role %', current_user;
    
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.id, bsj_group_id);
    
    RAISE LOG 'Successfully assigned user % (%) to BSJ group with role %', 
      NEW.id, 
      NEW.email,
      current_user;
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'User % already in BSJ group (unique violation)', NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error assigning user % to BSJ group: % (role: %)', 
        NEW.id, 
        SQLERRM,
        current_user;
      RAISE;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Unexpected error in handle_first_user for user % (%): % (role: %)', 
      NEW.id, 
      NEW.email,
      SQLERRM,
      current_user;
    RAISE;
END;
$$;