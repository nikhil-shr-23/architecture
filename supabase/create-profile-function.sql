-- Create a function to handle profile creation
CREATE OR REPLACE FUNCTION create_profile(
  user_id UUID,
  user_full_name TEXT,
  user_email TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (user_id, user_full_name, user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_profile(UUID, TEXT, TEXT) TO anon;
