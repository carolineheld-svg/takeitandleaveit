-- Comprehensive Migration: Selling Feature + Unified Messaging System
-- Run this file in your Supabase SQL Editor to add all new features

-- ================================================
-- PART 1: Add Selling Feature to Items Table
-- ================================================

-- Add new columns to items table
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'free' CHECK (listing_type IN ('free', 'for_sale')),
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';

-- Add comments to document the columns
COMMENT ON COLUMN public.items.listing_type IS 'Indicates if item is free or for sale';
COMMENT ON COLUMN public.items.price IS 'Price for items listed for sale (null for free items)';
COMMENT ON COLUMN public.items.payment_methods IS 'Array of accepted payment methods for items for sale';

-- Create index for faster filtering by listing type
CREATE INDEX IF NOT EXISTS idx_items_listing_type ON public.items(listing_type);

-- Update existing items to have default listing_type of 'free'
UPDATE public.items
SET listing_type = 'free'
WHERE listing_type IS NULL;

-- ================================================
-- PART 2: Create Unified Direct Messages Table
-- ================================================

-- Create direct_messages table for all user-to-user messaging
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
DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
CREATE POLICY "Users can view their own messages" ON public.direct_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

DROP POLICY IF EXISTS "Users can update their received messages" ON public.direct_messages;
CREATE POLICY "Users can update their received messages" ON public.direct_messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  );

DROP POLICY IF EXISTS "Users can delete their own sent messages" ON public.direct_messages;
CREATE POLICY "Users can delete their own sent messages" ON public.direct_messages
  FOR DELETE USING (
    auth.uid() = sender_id
  );

-- Admin policies
DROP POLICY IF EXISTS "Admin can view all direct messages" ON public.direct_messages;
CREATE POLICY "Admin can view all direct messages" ON public.direct_messages
  FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admin can delete any direct message" ON public.direct_messages;
CREATE POLICY "Admin can delete any direct message" ON public.direct_messages
  FOR DELETE USING (auth.role() = 'service_role');

-- ================================================
-- PART 3: Remove Old Chat Messages Table (Optional)
-- ================================================

-- Uncomment this line if you want to remove the old chat_messages table
-- WARNING: This will delete all existing trade chat history
-- DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- ================================================
-- Migration Complete!
-- ================================================

COMMENT ON TABLE public.direct_messages IS 'Unified messaging system for all user conversations';

