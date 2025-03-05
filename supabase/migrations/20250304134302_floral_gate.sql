/*
  # Add student group and make it default

  1. Changes
    - Add 'student' group back to groups table
    - Update handle_first_user function to assign new users to student group by default
    - Keep existing BSJ assignments intact
*/

-- Re-add student group
INSERT INTO groups (name)
VALUES ('student')
ON CONFLICT (name) DO NOTHING;

-- Update handle_first_user function
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_group_id uuid;
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

  -- Get student group ID
  SELECT id INTO student_group_id
  FROM groups
  WHERE name = 'student';

  -- Log group lookup result
  IF student_group_id IS NULL THEN
    RAISE LOG 'Student group not found in groups table';
    RAISE EXCEPTION 'Student group not found';
  ELSE
    RAISE LOG 'Found student group with ID: %', student_group_id;
  END IF;

  -- Attempt group assignment with role logging
  BEGIN
    RAISE LOG 'Attempting to insert user_group with role %', current_user;
    
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.id, student_group_id);
    
    RAISE LOG 'Successfully assigned user % (%) to student group with role %', 
      NEW.id, 
      NEW.email,
      current_user;
  EXCEPTION 
    WHEN unique_violation THEN
      RAISE LOG 'User % already in student group (unique violation)', NEW.id;
    WHEN OTHERS THEN
      RAISE LOG 'Error assigning user % to student group: % (role: %)', 
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