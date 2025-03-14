/*
  # Migrate to Supabase Storage

  1. Changes
    - Drop custom storage tables
    - Update job_documents table to use Supabase Storage URLs
    - Keep existing RLS policies

  2. Notes
    - Documents will be stored in Supabase Storage bucket
    - URLs will point to Supabase Storage
*/

-- Drop custom storage tables
DROP TABLE IF EXISTS storage_versions;
DROP TABLE IF EXISTS storage_objects;

-- Update job_documents table to use Supabase Storage URLs
ALTER TABLE job_documents 
ALTER COLUMN file_url TYPE text;