-- First, drop any existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

-- Add a more permissive INSERT policy for profiles table
CREATE POLICY "Anyone can insert profiles"
ON profiles FOR INSERT WITH CHECK (true);

-- Add a policy for service role operations
CREATE POLICY "Service role can manage all profiles"
ON profiles USING (auth.role() = 'service_role');
