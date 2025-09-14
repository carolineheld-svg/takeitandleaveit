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
  condition TEXT NOT NULL CHECK (condition IN ('Excellent', 'Decent', 'So-so', 'Poor')),
  size TEXT NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'traded')),
  is_traded BOOLEAN DEFAULT FALSE,
  traded_at TIMESTAMP WITH TIME ZONE,
  traded_to_user_id UUID REFERENCES public.profiles(id)
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
  browsing_history JSONB DEFAULT '{}',
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

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

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
RETURNS TRIGGER AS $$
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
RETURNS VOID AS $$
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

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_item_id ON public.wishlist(item_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
