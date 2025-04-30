-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  salary_range TEXT,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  application_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'filled', 'expired', 'draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jobs
CREATE POLICY "Anyone can view active jobs"
ON jobs FOR SELECT
USING (status = 'active' OR auth.uid() = posted_by);

CREATE POLICY "Users can create their own job listings"
ON jobs FOR INSERT
WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Users can update their own job listings"
ON jobs FOR UPDATE
USING (auth.uid() = posted_by);

CREATE POLICY "Users can delete their own job listings"
ON jobs FOR DELETE
USING (auth.uid() = posted_by);

-- Create trigger to update updated_at
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
