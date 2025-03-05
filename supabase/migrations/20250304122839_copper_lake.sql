/*
  # Remove student group
  
  1. Changes
    - Remove student group from groups table
    - Update handle_first_user function to use 'bsj' as default group
    - Migrate existing student group users to 'bsj' group
*/

-- First, get the IDs we need
DO $$ 
DECLARE
  student_group_id uuid;
  bsj_group_id uuid;
BEGIN
  -- Get the group IDs
  SELECT id INTO student_group_id FROM groups WHERE name = 'student';
  SELECT id INTO bsj_group_id FROM groups WHERE name = 'bsj';

  -- Move users from student group to bsj group
  IF student_group_id IS NOT NULL AND bsj_group_id IS NOT NULL THEN
    INSERT INTO user_groups (user_id, group_id)
    SELECT user_id, bsj_group_id
    FROM user_groups
    WHERE group_id = student_group_id
    ON CONFLICT (user_id, group_id) DO NOTHING;
    
    -- Remove old student group assignments
    DELETE FROM user_groups WHERE group_id = student_group_id;
  END IF;
END $$;

-- Delete the student group
DELETE FROM groups WHERE name = 'student';

-- Update handle_first_user function to use bsj as default
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bsj_group_id uuid;
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
  SELECT id INTO bsj_group_id
  FROM groups
  WHERE name = 'bsj';

  SELECT id INTO admin_group_id
  FROM groups
  WHERE name = 'admin';

  -- Validate groups exist
  IF bsj_group_id IS NULL OR admin_group_id IS NULL THEN
    RAISE LOG 'Missing required groups. BSJ group: %, Admin group: %', bsj_group_id, admin_group_id;
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
    VALUES (NEW.id, bsj_group_id)
    ON CONFLICT DO NOTHING;
    
    RAISE LOG 'Assigned user % to BSJ group', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_first_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;