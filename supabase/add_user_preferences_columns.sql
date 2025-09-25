-- Add missing columns to user_preferences table
-- Run this in your Supabase SQL Editor

-- First, check if the table exists and what columns it has
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND table_schema = 'public';

-- Add the missing columns if they don't exist
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS size_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_preferences JSONB DEFAULT '{}';

-- Update the existing records to have default values for new columns
UPDATE public.user_preferences 
SET 
  size_preferences = COALESCE(size_preferences, '{}'::jsonb),
  search_history = COALESCE(search_history, '[]'::jsonb),
  ai_preferences = COALESCE(ai_preferences, '{}'::jsonb)
WHERE size_preferences IS NULL 
   OR search_history IS NULL 
   OR ai_preferences IS NULL;

-- Verify the table structure after adding columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;
