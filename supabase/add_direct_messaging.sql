-- Migration: Add direct messaging feature
-- Allows users to message each other about items without sending a trade request

-- Create direct_messages table for user-to-user messaging
CREATE TABLE IF NOT EXISTS public.direct_messages (
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
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_item ON public.direct_messages(item_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_messages
CREATE POLICY "Users can view their own messages" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Users can update their received messages" ON public.direct_messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can delete their own sent messages" ON public.direct_messages
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- Admin policies
CREATE POLICY "Admin can view all direct messages" ON public.direct_messages
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any direct message" ON public.direct_messages
  FOR DELETE USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.direct_messages IS 'Direct messages between users about items, independent of trade requests';

