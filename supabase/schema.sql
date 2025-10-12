-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT
);

-- Create items table
CREATE TABLE public.items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Good', 'OK', 'Subpar')),
  size TEXT,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'traded')),
  is_traded BOOLEAN DEFAULT FALSE,
  traded_at TIMESTAMP WITH TIME ZONE,
  traded_to_user_id UUID REFERENCES public.profiles(id),
  listing_type TEXT DEFAULT 'free' CHECK (listing_type IN ('free', 'for_sale')),
  price DECIMAL(10, 2),
  payment_methods TEXT[] DEFAULT '{}'
);

-- Create trade_requests table
CREATE TABLE public.trade_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  message TEXT,
  meeting_location TEXT REFERENCES public.campus_locations(name)
);

-- Create campus_impact table
CREATE TABLE public.campus_impact (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_items_traded INTEGER DEFAULT 0,
  total_users_participating INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chat_message', 'trade_request', 'trade_accepted', 'trade_declined', 'item_sold', 'item_bought', 'recommendation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  related_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  related_trade_request_id UUID REFERENCES public.trade_requests(id) ON DELETE CASCADE,
  related_chat_message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Create wishlist table
CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Create user_preferences table for recommendations
CREATE TABLE public.user_preferences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  favorite_categories TEXT[] DEFAULT '{}',
  favorite_brands TEXT[] DEFAULT '{}',
  preferred_sizes TEXT[] DEFAULT '{}',
  size_preferences JSONB DEFAULT '{}',
  browsing_history JSONB DEFAULT '{}',
  search_history JSONB DEFAULT '{}',
  ai_preferences JSONB DEFAULT '{}',
  last_recommendation_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campus_locations table
CREATE TABLE public.campus_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert campus locations
INSERT INTO public.campus_locations (name) VALUES
('Bothin Stairs'),
('Keck Lab'),
('Lower Booth'),
('Upper Booth'),
('Day Student Lounge'),
('Old Gym'),
('New Gym'),
('Pars'),
('High House'),
('Schoolhouse'),
('Kirby Quad'),
('CHE'),
('CHW'),
('Bothin'),
('CoLab'),
('McBean'),
('Johnson Library'),
('Theater'),
('Senior Lawn'),
('Pizza Lawn');

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trade_request_id UUID REFERENCES public.trade_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

-- Create direct_messages table for user-to-user messaging
CREATE TABLE public.direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_items_user_id ON public.items(user_id);
CREATE INDEX idx_items_is_traded ON public.items(is_traded);
CREATE INDEX idx_items_created_at ON public.items(created_at DESC);
CREATE INDEX idx_trade_requests_from_user ON public.trade_requests(from_user_id);
CREATE INDEX idx_trade_requests_to_user ON public.trade_requests(to_user_id);
CREATE INDEX idx_trade_requests_item_id ON public.trade_requests(item_id);
CREATE INDEX idx_trade_requests_status ON public.trade_requests(status);
CREATE INDEX idx_chat_messages_trade_request ON public.chat_messages(trade_request_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_item ON public.direct_messages(item_id);
CREATE INDEX idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_impact ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Items are viewable by everyone" ON public.items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own items" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON public.items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON public.items
  FOR DELETE USING (auth.uid() = user_id);

-- Trade requests policies
CREATE POLICY "Users can view their own trade requests" ON public.trade_requests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create trade requests" ON public.trade_requests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update trade requests they received" ON public.trade_requests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages for their trade requests" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trade_requests 
      WHERE id = trade_request_id 
      AND (from_user_id = auth.uid() OR to_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages for their trade requests" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.trade_requests 
      WHERE id = trade_request_id 
      AND (from_user_id = auth.uid() OR to_user_id = auth.uid())
    )
  );

-- Direct messages policies
CREATE POLICY "Users can view their own direct messages" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Users can update their received direct messages" ON public.direct_messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can delete their own sent direct messages" ON public.direct_messages
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trade_requests_updated_at
  BEFORE UPDATE ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle trade completion
CREATE OR REPLACE FUNCTION public.complete_trade(trade_request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_record RECORD;
BEGIN
  -- Get trade request details
  SELECT * INTO trade_record 
  FROM public.trade_requests 
  WHERE id = trade_request_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade request not found or not accepted';
  END IF;
  
  -- Mark item as traded
  UPDATE public.items 
  SET 
    is_traded = TRUE,
    traded_at = NOW(),
    traded_to_user_id = trade_record.from_user_id
  WHERE id = trade_record.item_id;
  
  -- Update trade request status
  UPDATE public.trade_requests
  SET status = 'completed'
  WHERE id = trade_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist" ON public.wishlist
  FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Campus locations policies
CREATE POLICY "Anyone can view campus locations" ON public.campus_locations
  FOR SELECT USING (true);

-- Campus impact policies
CREATE POLICY "Anyone can view campus impact" ON public.campus_impact
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_item_id ON public.wishlist(item_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- User Deletion Policies
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

-- Admin policies for user management (requires service_role)
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any profile" ON public.profiles
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any profile" ON public.profiles
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for items management
CREATE POLICY "Admin can view all items" ON public.items
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any item" ON public.items
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any item" ON public.items
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for trade requests management
CREATE POLICY "Admin can view all trade requests" ON public.trade_requests
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any trade request" ON public.trade_requests
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any trade request" ON public.trade_requests
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for direct messages management
CREATE POLICY "Admin can view all direct messages" ON public.direct_messages
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any direct message" ON public.direct_messages
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for notifications management
CREATE POLICY "Admin can view all notifications" ON public.notifications
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any notification" ON public.notifications
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any notification" ON public.notifications
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for wishlist management
CREATE POLICY "Admin can view all wishlists" ON public.wishlist
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any wishlist" ON public.wishlist
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any wishlist" ON public.wishlist
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for user preferences management
CREATE POLICY "Admin can view all user preferences" ON public.user_preferences
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any user preferences" ON public.user_preferences
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any user preferences" ON public.user_preferences
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for carbon footprint management
CREATE POLICY "Admin can view all carbon savings" ON public.user_carbon_savings
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can update any carbon savings" ON public.user_carbon_savings
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any carbon savings" ON public.user_carbon_savings
  FOR DELETE USING (auth.role() = 'service_role');

-- Admin policies for campus impact management
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
