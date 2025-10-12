-- ================================================================
-- SIMPLE MIGRATION: Run this in Supabase SQL Editor
-- This adds selling features and unified messaging to your database
-- ================================================================

-- STEP 1: Add Selling Features to Items
-- ================================================================
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS listing_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';

-- Add constraint if not exists (workaround for Postgres)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'items_listing_type_check'
  ) THEN
    ALTER TABLE public.items 
    ADD CONSTRAINT items_listing_type_check 
    CHECK (listing_type IN ('free', 'for_sale'));
  END IF;
END $$;

-- Update existing items
UPDATE public.items
SET listing_type = 'free'
WHERE listing_type IS NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_items_listing_type ON public.items(listing_type);


-- STEP 2: Create Direct Messages Table
-- ================================================================
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

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_item ON public.direct_messages(item_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON public.direct_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;


-- STEP 3: Add RLS Policies for Direct Messages
-- ================================================================

-- Drop existing policies if they exist (to avoid errors)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own messages" ON public.direct_messages;
  DROP POLICY IF EXISTS "Users can send messages" ON public.direct_messages;
  DROP POLICY IF EXISTS "Users can update their received messages" ON public.direct_messages;
  DROP POLICY IF EXISTS "Users can delete their own sent messages" ON public.direct_messages;
  DROP POLICY IF EXISTS "Admin can view all direct messages" ON public.direct_messages;
  DROP POLICY IF EXISTS "Admin can delete any direct message" ON public.direct_messages;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create policies
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

CREATE POLICY "Admin can view all direct messages" ON public.direct_messages
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Admin can delete any direct message" ON public.direct_messages
  FOR DELETE USING (auth.role() = 'service_role');


-- ================================================================
-- MIGRATION COMPLETE!
-- ================================================================
-- Your database now supports:
-- ✅ Selling feature (free or for sale items with pricing)
-- ✅ Unified messaging system (one inbox for all conversations)
-- ✅ Trade requests still work (accept/decline + mark as traded)
-- ================================================================

