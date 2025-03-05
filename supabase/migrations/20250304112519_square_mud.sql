/*
  # Update user group assignment

  1. Changes
    - Modify handle_first_user() function to always assign new users to student group
    - Add better error handling and logging
    - Remove first user special case
*/

-- Drop and recreate the function with new logic
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  student_group_id uuid;
BEGIN
  -- Check if user already exists in user_groups
  IF EXISTS (
    SELECT 1 
    FROM user_groups 
    WHERE user_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  -- Get student group ID
  SELECT id INTO student_group_id
  FROM groups
  WHERE name = 'student';

  -- Ensure we found the student group
  IF student_group_id IS NULL THEN
    RAISE EXCEPTION 'Student group not found';
  END IF;

  -- Insert the user-group relationship
  INSERT INTO user_groups (user_id, group_id)
  VALUES (NEW.id, student_group_id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details but don't prevent user creation
    RAISE WARNING 'Error in handle_first_user: %', SQLERRM;
    RETURN NEW;
END;
$$;