-- Add resume_name column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_name TEXT;
