/*
  # Create storage bucket for job documents

  1. Changes
    - Create storage bucket for job documents
    - Set bucket to public for easy access
    - Add CORS policy for frontend access
*/

-- Enable storage if not already enabled
CREATE EXTENSION IF NOT EXISTS "storage" WITH SCHEMA "storage";

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-documents', 'job-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set CORS policy
UPDATE storage.buckets
SET cors_origins = array['*']
WHERE id = 'job-documents';