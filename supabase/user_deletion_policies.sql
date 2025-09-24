-- User Deletion and Updated RLS Policies
-- This script adds missing DELETE policies and updates existing ones for better user management

-- Add missing DELETE policy for profiles
CREATE POLICY "Users can delete their own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Add missing DELETE policies for trade_requests
CREATE POLICY "Users can delete their own outgoing trade requests" ON public.trade_requests
  FOR DELETE USING (auth.uid() = from_user_id);

CREATE POLICY "Users can delete trade requests they received" ON public.trade_requests
  FOR DELETE USING (auth.uid() = to_user_id);

-- Add missing DELETE policies for chat_messages
CREATE POLICY "Users can delete their own chat messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- Add missing DELETE policies for notifications
CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Add missing DELETE policies for carbon footprint tables
CREATE POLICY "Users can delete their own carbon savings" ON public.user_carbon_savings
  FOR DELETE USING (auth.uid() = user_id);

-- Update existing policies to be more specific and secure
-- Update profiles policy to allow system operations
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Update items policy to allow system operations
DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Update trade requests policy to allow system operations
DROP POLICY IF EXISTS "Users can create trade requests" ON public.trade_requests;
CREATE POLICY "Users can create trade requests" ON public.trade_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id OR auth.role() = 'service_role');

-- Update notifications policy to allow system operations
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true OR auth.role() = 'service_role');

-- Add admin policies for user management (requires service_role)
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any profile" ON public.profiles
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for items management
CREATE POLICY "Admin can view all items" ON public.items
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any item" ON public.items
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any item" ON public.items
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for trade requests management
CREATE POLICY "Admin can view all trade requests" ON public.trade_requests
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any trade request" ON public.trade_requests
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any trade request" ON public.trade_requests
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for notifications management
CREATE POLICY "Admin can view all notifications" ON public.notifications
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any notification" ON public.notifications
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any notification" ON public.notifications
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for wishlist management
CREATE POLICY "Admin can view all wishlists" ON public.wishlist
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any wishlist" ON public.wishlist
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any wishlist" ON public.wishlist
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for user preferences management
CREATE POLICY "Admin can view all user preferences" ON public.user_preferences
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any user preferences" ON public.user_preferences
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any user preferences" ON public.user_preferences
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for carbon footprint management
CREATE POLICY "Admin can view all carbon savings" ON public.user_carbon_savings
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any carbon savings" ON public.user_carbon_savings
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any carbon savings" ON public.user_carbon_savings
  FOR DELETE USING (auth.role() = 'service_role');

-- Add admin policies for campus impact management
CREATE POLICY "Admin can manage campus impact" ON public.campus_carbon_impact
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admin can manage carbon categories" ON public.carbon_footprint_categories
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to safely delete a user and all their data
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_to_delete) THEN
    RAISE EXCEPTION 'User with ID % does not exist', user_id_to_delete;
  END IF;

  -- Delete user data in the correct order (respecting foreign key constraints)
  -- 1. Delete notifications
  DELETE FROM public.notifications WHERE user_id = user_id_to_delete;
  
  -- 2. Delete wishlist items
  DELETE FROM public.wishlist WHERE user_id = user_id_to_delete;
  
  -- 3. Delete user preferences
  DELETE FROM public.user_preferences WHERE user_id = user_id_to_delete;
  
  -- 4. Delete carbon savings
  DELETE FROM public.user_carbon_savings WHERE user_id = user_id_to_delete;
  
  -- 5. Delete chat messages where user is sender
  DELETE FROM public.chat_messages WHERE sender_id = user_id_to_delete;
  
  -- 6. Delete trade requests where user is involved
  DELETE FROM public.trade_requests WHERE from_user_id = user_id_to_delete OR to_user_id = user_id_to_delete;
  
  -- 7. Update items traded to this user
  UPDATE public.items SET traded_to_user_id = NULL WHERE traded_to_user_id = user_id_to_delete;
  
  -- 8. Delete items owned by user
  DELETE FROM public.items WHERE user_id = user_id_to_delete;
  
  -- 9. Finally, delete the profile (this will cascade to auth.users due to the foreign key)
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  RAISE NOTICE 'User account % and all associated data deleted successfully', user_id_to_delete;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.delete_user_account(UUID) TO service_role;

-- Create a function to get user statistics before deletion
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id_to_check UUID)
RETURNS TABLE (
  items_count BIGINT,
  trade_requests_sent BIGINT,
  trade_requests_received BIGINT,
  chat_messages_count BIGINT,
  notifications_count BIGINT,
  wishlist_items_count BIGINT,
  carbon_savings_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.items WHERE user_id = user_id_to_check) as items_count,
    (SELECT COUNT(*) FROM public.trade_requests WHERE from_user_id = user_id_to_check) as trade_requests_sent,
    (SELECT COUNT(*) FROM public.trade_requests WHERE to_user_id = user_id_to_check) as trade_requests_received,
    (SELECT COUNT(*) FROM public.chat_messages WHERE sender_id = user_id_to_check) as chat_messages_count,
    (SELECT COUNT(*) FROM public.notifications WHERE user_id = user_id_to_check) as notifications_count,
    (SELECT COUNT(*) FROM public.wishlist WHERE user_id = user_id_to_check) as wishlist_items_count,
    (SELECT COUNT(*) FROM public.user_carbon_savings WHERE user_id = user_id_to_check) as carbon_savings_count;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID) TO service_role;
