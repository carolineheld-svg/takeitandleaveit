-- Notifications System Migration
-- Run this in your Supabase SQL editor to add the new features

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
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
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Create user_preferences table for recommendations
CREATE TABLE IF NOT EXISTS public.user_preferences (
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

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_item_id ON public.wishlist(item_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Function to create notifications for trade requests
CREATE OR REPLACE FUNCTION public.create_trade_request_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_trade_request_id,
    action_url
  ) VALUES (
    NEW.to_user_id,
    'trade_request',
    'New Trade Request',
    'You received a new trade request for your item.',
    NEW.id,
    '/trades'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for trade status changes
CREATE OR REPLACE FUNCTION public.create_trade_status_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_trade_request_id,
        action_url
      ) VALUES (
        NEW.from_user_id,
        'trade_accepted',
        'Trade Request Accepted',
        'Your trade request has been accepted! You can now coordinate the exchange.',
        NEW.id,
        '/trades'
      );
    ELSIF NEW.status = 'declined' THEN
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_trade_request_id,
        action_url
      ) VALUES (
        NEW.from_user_id,
        'trade_declined',
        'Trade Request Declined',
        'Your trade request has been declined.',
        NEW.id,
        '/trades'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications for chat messages
CREATE OR REPLACE FUNCTION public.create_chat_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  trade_record RECORD;
BEGIN
  -- Get the trade request to find the recipient
  SELECT * INTO trade_record 
  FROM public.trade_requests 
  WHERE id = NEW.trade_request_id;
  
  -- Create notification for the recipient (not the sender)
  IF trade_record.from_user_id != NEW.sender_id THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_chat_message_id,
      related_trade_request_id,
      action_url
    ) VALUES (
      trade_record.from_user_id,
      'chat_message',
      'New Message',
      'You received a new message about your trade.',
      NEW.id,
      NEW.trade_request_id,
      '/trades'
    );
  ELSE
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_chat_message_id,
      related_trade_request_id,
      action_url
    ) VALUES (
      trade_record.to_user_id,
      'chat_message',
      'New Message',
      'You received a new message about your trade.',
      NEW.id,
      NEW.trade_request_id,
      '/trades'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trade_request_notification_trigger ON public.trade_requests;
CREATE TRIGGER trade_request_notification_trigger
  AFTER INSERT ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_trade_request_notification();

DROP TRIGGER IF EXISTS trade_status_notification_trigger ON public.trade_requests;
CREATE TRIGGER trade_status_notification_trigger
  AFTER UPDATE ON public.trade_requests
  FOR EACH ROW EXECUTE FUNCTION public.create_trade_status_notification();

DROP TRIGGER IF EXISTS chat_message_notification_trigger ON public.chat_messages;
CREATE TRIGGER chat_message_notification_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.create_chat_message_notification();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
