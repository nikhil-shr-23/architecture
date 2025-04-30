-- Add resume fields to profiles table if they don't exist
DO $$
BEGIN
    -- Check if resume_url column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'resume_url'
    ) THEN
        -- Add resume_url column
        ALTER TABLE profiles ADD COLUMN resume_url TEXT;
    END IF;

    -- Check if resume_name column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'resume_name'
    ) THEN
        -- Add resume_name column
        ALTER TABLE profiles ADD COLUMN resume_name TEXT;
    END IF;
END
$$;
