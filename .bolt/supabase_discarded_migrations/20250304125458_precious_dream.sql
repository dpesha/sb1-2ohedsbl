/*
  # Check trigger existence

  This migration creates a function to check if the on_auth_user_created trigger exists
  and returns relevant information about it.
*/

CREATE OR REPLACE FUNCTION check_auth_trigger()
RETURNS TABLE (
  trigger_name text,
  trigger_table text,
  trigger_schema text,
  trigger_event text,
  trigger_timing text,
  trigger_function text,
  trigger_enabled text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tg.tgname::text as trigger_name,
    cl.relname::text as trigger_table,
    ns.nspname::text as trigger_schema,
    CASE 
      WHEN tg.tgtype & 1 = 1 THEN 'ROW'
      ELSE 'STATEMENT'
    END as trigger_event,
    CASE 
      WHEN tg.tgtype & 2 = 2 THEN 'BEFORE'
      WHEN tg.tgtype & 64 = 64 THEN 'INSTEAD OF'
      ELSE 'AFTER'
    END as trigger_timing,
    p.proname::text as trigger_function,
    CASE 
      WHEN tg.tgenabled = 'D' THEN 'DISABLED'
      ELSE 'ENABLED'
    END as trigger_enabled
  FROM pg_trigger tg
  JOIN pg_class cl ON cl.oid = tg.tgrelid
  JOIN pg_namespace ns ON ns.oid = cl.relnamespace
  JOIN pg_proc p ON p.oid = tg.tgfoid
  WHERE tg.tgname = 'on_auth_user_created'
  AND ns.nspname = 'auth';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_auth_trigger() TO authenticated;