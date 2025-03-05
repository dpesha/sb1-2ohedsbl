/*
  # Fix user groups and permissions system

  1. New Tables
    - `groups`: Stores available permission groups
    - `user_groups`: Maps users to their groups
    
  2. Security
    - Enable RLS on both tables
    - Only admin group members can manage groups
    - Automatically assign new users to student group
    - First user gets admin group
    
  3. Functions
    - Function to check if user is admin
    - Function to get user's groups
    - Function to remove user from group
    - Updated get_users function with groups
*/

-- Drop existing function first
DROP FUNCTION IF EXISTS get_users();

-- Create groups table
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create user_groups table
CREATE TABLE user_groups (
  user_id uuid REFERENCES auth.users NOT NULL,
  group_id uuid REFERENCES groups NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;

-- Insert default groups
INSERT INTO groups (name) VALUES
  ('admin'),
  ('student'),
  ('bsi'),
  ('bsj');

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_groups ug 
    JOIN groups g ON g.id = ug.group_id 
    WHERE g.name = 'admin' 
    AND ug.user_id = auth.uid()
  );
END;
$$;

-- Create function to get user's groups
CREATE OR REPLACE FUNCTION get_user_groups(user_id uuid)
RETURNS TABLE (
  group_id uuid,
  group_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.name
  FROM groups g
  JOIN user_groups ug ON ug.group_id = g.id
  WHERE ug.user_id = user_id;
END;
$$;

-- Create function to remove user from group
CREATE OR REPLACE FUNCTION remove_user_from_group(
  p_user_id uuid,
  p_group_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM user_groups
  WHERE user_id = p_user_id
  AND group_id = (
    SELECT id FROM groups WHERE name = p_group_name
  );
END;
$$;

-- Create function to handle first user
CREATE OR REPLACE FUNCTION handle_first_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_groups LIMIT 1) THEN
    -- First user gets admin group
    INSERT INTO user_groups (user_id, group_id)
    SELECT NEW.id, g.id
    FROM groups g
    WHERE g.name = 'admin';
  ELSE
    -- Subsequent users get student group
    INSERT INTO user_groups (user_id, group_id)
    SELECT NEW.id, g.id
    FROM groups g
    WHERE g.name = 'student';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for new user assignments
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_first_user();

-- Policies for groups table
CREATE POLICY "Admins can view groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Policies for user_groups table
CREATE POLICY "Admins can manage user groups"
  ON user_groups
  FOR ALL
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view their own groups"
  ON user_groups
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated get_users function with groups
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),
  created_at timestamptz,
  last_sign_in_at timestamptz,
  groups text[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF is_admin() THEN
    RETURN QUERY
    SELECT 
      u.id,
      u.email::varchar(255),
      u.created_at,
      u.last_sign_in_at,
      array_agg(COALESCE(g.name, 'none')) as groups
    FROM auth.users u
    LEFT JOIN user_groups ug ON ug.user_id = u.id
    LEFT JOIN groups g ON g.id = ug.group_id
    GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at
    ORDER BY u.created_at DESC;
  ELSE
    RAISE EXCEPTION 'Not authorized';
  END IF;
END;
$$;