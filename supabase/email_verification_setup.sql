-- Email Verification Setup for TakeItAndLeaveIt
-- Run this in your Supabase SQL Editor to configure email verification

-- 1. Enable email confirmations (this should already be enabled in Supabase Dashboard)
-- Go to Authentication > Settings > Email and ensure "Enable email confirmations" is checked

-- 2. Update the auth.users table to require email confirmation
-- This is automatically handled by Supabase when email confirmations are enabled

-- 3. Create a function to handle email verification redirects
CREATE OR REPLACE FUNCTION handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used for custom logic after email confirmation
  -- For now, we'll just log the confirmation
  RAISE NOTICE 'User % confirmed email', NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a trigger to call this function after email confirmation
-- Note: This is handled automatically by Supabase's built-in email confirmation system

-- 5. Update RLS policies to ensure only confirmed users can access the app
-- Update existing policies to check for email_confirmed_at

-- Example policy update for profiles table:
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id 
    AND auth.users.email_confirmed_at IS NOT NULL
  );

-- Update other policies similarly...
-- (This is just an example - you may want to update all relevant policies)

-- 6. Create a function to check if user's email is confirmed
CREATE OR REPLACE FUNCTION is_email_confirmed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Add a view for easy access to user confirmation status
CREATE OR REPLACE VIEW user_confirmation_status AS
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'confirmed'
    ELSE 'pending'
  END as status
FROM auth.users;

-- Grant access to authenticated users
GRANT SELECT ON user_confirmation_status TO authenticated;
