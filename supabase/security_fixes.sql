-- Security Fixes for Supabase
-- Run this script in your Supabase SQL Editor to fix security warnings

-- 1. Enable RLS for campus_locations table
ALTER TABLE public.campus_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for campus_locations (read-only for all authenticated users)
CREATE POLICY "Anyone can view campus locations" ON public.campus_locations
  FOR SELECT USING (true);

-- 2. Enable RLS for campus_impact table
ALTER TABLE public.campus_impact ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for campus_impact (read-only for all authenticated users)
CREATE POLICY "Anyone can view campus impact" ON public.campus_impact
  FOR SELECT USING (true);

-- 3. Fix search_path for all functions to prevent security issues

-- Fix complete_trade function
CREATE OR REPLACE FUNCTION public.complete_trade()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark the item as traded
  UPDATE public.items 
  SET 
    is_traded = true,
    traded_at = NOW(),
    traded_to_user_id = NEW.from_user_id,
    status = 'traded'
  WHERE id = NEW.item_id;

  -- Create notification for the trade completion
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    related_item_id,
    related_trade_request_id,
    related_chat_message_id,
    metadata
  ) VALUES (
    NEW.from_user_id,
    'item_bought',
    'Trade Completed',
    'Your trade request has been completed successfully!',
    false,
    null,
    NEW.item_id,
    NEW.id,
    null,
    '{}'
  );

  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', null),
    null
  );
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
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
$$;

-- Fix create_trade_request_notification function
CREATE OR REPLACE FUNCTION public.create_trade_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    related_item_id,
    related_trade_request_id,
    related_chat_message_id,
    metadata
  ) VALUES (
    NEW.to_user_id,
    'trade_request',
    'New Trade Request',
    'You have received a new trade request for your item.',
    false,
    null,
    NEW.item_id,
    NEW.id,
    null,
    '{}'
  );
  RETURN NEW;
END;
$$;

-- Fix create_trade_status_notification function
CREATE OR REPLACE FUNCTION public.create_trade_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      read_at,
      related_item_id,
      related_trade_request_id,
      related_chat_message_id,
      metadata
    ) VALUES (
      NEW.from_user_id,
      'trade_accepted',
      'Trade Request Accepted',
      'Your trade request has been accepted!',
      false,
      null,
      NEW.item_id,
      NEW.id,
      null,
      '{}'
    );
  ELSIF NEW.status = 'declined' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      read_at,
      related_item_id,
      related_trade_request_id,
      related_chat_message_id,
      metadata
    ) VALUES (
      NEW.from_user_id,
      'trade_declined',
      'Trade Request Declined',
      'Your trade request has been declined.',
      false,
      null,
      NEW.item_id,
      NEW.id,
      null,
      '{}'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix create_chat_message_notification function (if it exists)
CREATE OR REPLACE FUNCTION public.create_chat_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trade_request_record RECORD;
BEGIN
  -- Get trade request details
  SELECT * INTO trade_request_record
  FROM public.trade_requests
  WHERE id = NEW.trade_request_id;

  -- Create notification for the other user
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    read_at,
    related_item_id,
    related_trade_request_id,
    related_chat_message_id,
    metadata
  ) VALUES (
    CASE 
      WHEN NEW.sender_id = trade_request_record.from_user_id 
      THEN trade_request_record.to_user_id
      ELSE trade_request_record.from_user_id
    END,
    'chat_message',
    'New Message',
    'You have received a new message in your trade conversation.',
    false,
    null,
    trade_request_record.item_id,
    NEW.trade_request_id,
    NEW.id,
    '{}'
  );
  RETURN NEW;
END;
$$;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- 5. Update campus_impact table with proper structure (if needed)
DO $$
BEGIN
  -- Add id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'campus_impact' AND column_name = 'id') THEN
    ALTER TABLE public.campus_impact ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
  END IF;
END $$;

-- 6. Ensure proper constraints and defaults
ALTER TABLE public.campus_impact ALTER COLUMN total_items_traded SET DEFAULT 0;
ALTER TABLE public.campus_impact ALTER COLUMN total_users_participating SET DEFAULT 0;

-- Insert initial campus impact record if it doesn't exist
INSERT INTO public.campus_impact (total_items_traded, total_users_participating, last_updated)
SELECT 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.campus_impact LIMIT 1);

-- 7. Verify all RLS policies are in place
-- List all tables with RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'items', 'trade_requests', 'chat_messages', 'notifications', 'wishlist', 'user_preferences', 'campus_locations', 'campus_impact');

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
