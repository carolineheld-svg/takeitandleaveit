-- Ensure user_preferences table exists with all required columns
-- Run this in your Supabase SQL Editor

-- First, check if the table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_preferences';

-- If table doesn't exist, create it
CREATE TABLE IF NOT EXISTS public.user_preferences (
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
  ai_preferences JSONB DEFAULT '{}'
);

-- Add any missing columns if they don't exist
DO $$ 
BEGIN
    -- Add size_preferences if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' 
                   AND column_name = 'size_preferences') THEN
        ALTER TABLE public.user_preferences ADD COLUMN size_preferences JSONB DEFAULT '{}';
    END IF;
    
    -- Add search_history if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' 
                   AND column_name = 'search_history') THEN
        ALTER TABLE public.user_preferences ADD COLUMN search_history JSONB DEFAULT '[]';
    END IF;
    
    -- Add ai_preferences if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_preferences' 
                   AND column_name = 'ai_preferences') THEN
        ALTER TABLE public.user_preferences ADD COLUMN ai_preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
AND table_schema = 'public'
ORDER BY ordinal_position;
