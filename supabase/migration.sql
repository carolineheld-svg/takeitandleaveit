-- Migration script to add new columns to existing tables
-- Run this in your Supabase SQL editor

-- Add new columns to items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';

-- Update the condition constraint to match new values
ALTER TABLE public.items 
DROP CONSTRAINT IF EXISTS items_condition_check;

ALTER TABLE public.items 
ADD CONSTRAINT items_condition_check 
CHECK (condition IN ('Excellent', 'Decent', 'So-so', 'Poor'));

-- Add status constraint
ALTER TABLE public.items 
ADD CONSTRAINT items_status_check 
CHECK (status IN ('available', 'pending', 'traded'));

-- Make category required for new items (set default for existing items)
UPDATE public.items SET category = 'Other' WHERE category IS NULL;
ALTER TABLE public.items ALTER COLUMN category SET NOT NULL;

-- Create campus_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campus_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Insert campus locations (ignore if already exist)
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
('Pizza Lawn')
ON CONFLICT (name) DO NOTHING;

-- Create campus_impact table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campus_impact (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_items_traded INTEGER DEFAULT 0,
  total_users_participating INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial campus impact record if it doesn't exist
INSERT INTO public.campus_impact (total_items_traded, total_users_participating, last_updated)
SELECT 0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.campus_impact);

-- Add meeting_location to trade_requests table if it doesn't exist
ALTER TABLE public.trade_requests 
ADD COLUMN IF NOT EXISTS meeting_location TEXT REFERENCES public.campus_locations(name);

-- Update trade_requests status constraint
ALTER TABLE public.trade_requests 
DROP CONSTRAINT IF EXISTS trade_requests_status_check;

ALTER TABLE public.trade_requests 
ADD CONSTRAINT trade_requests_status_check 
CHECK (status IN ('pending', 'accepted', 'declined', 'completed'));
