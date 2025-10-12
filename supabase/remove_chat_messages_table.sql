-- Migration: Remove chat_messages table and merge into direct_messages
-- This unifies the messaging system into one table

-- Drop the chat_messages table and all its dependencies
DROP TABLE IF EXISTS public.chat_messages CASCADE;

-- Note: All new conversations will use the direct_messages table
-- This migration does not migrate existing chat_messages data
-- If you need to preserve existing conversations, please contact support

