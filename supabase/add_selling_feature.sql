-- Migration: Add selling feature to items table
-- This allows users to list items for sale with price and payment methods

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

