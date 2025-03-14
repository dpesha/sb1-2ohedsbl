/*
  # Remove identity_document field from students table

  1. Changes
    - Remove identity_document column from students table
    - Remove references to identity_document in code
    
  2. Notes
    - Removes unused field
    - Simplifies student data structure
*/

-- Remove identity_document column from students table
ALTER TABLE students DROP COLUMN IF EXISTS identity_document;