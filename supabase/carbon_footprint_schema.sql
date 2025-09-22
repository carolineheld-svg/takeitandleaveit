-- Carbon Footprint Tracking Schema
-- This extends the existing schema to track environmental impact

-- Create carbon_footprint_categories table for different item types
CREATE TABLE public.carbon_footprint_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL UNIQUE,
  subcategory TEXT,
  kg_co2_per_item DECIMAL(10,4) NOT NULL, -- CO2 emissions per item (kg)
  manufacturing_emissions DECIMAL(10,4) NOT NULL, -- Manufacturing CO2 (kg)
  transportation_emissions DECIMAL(10,4) NOT NULL, -- Transportation CO2 (kg)
  disposal_emissions DECIMAL(10,4) NOT NULL, -- Disposal CO2 (kg)
  water_usage_liters DECIMAL(10,2), -- Water usage in liters
  description TEXT
);

-- Create user_carbon_savings table to track individual impact
CREATE TABLE public.user_carbon_savings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES public.trade_requests(id) ON DELETE CASCADE,
  co2_saved_kg DECIMAL(10,4) NOT NULL,
  water_saved_liters DECIMAL(10,2),
  waste_diverted_kg DECIMAL(10,4),
  savings_type TEXT NOT NULL CHECK (savings_type IN ('trade_completed', 'item_listed', 'wishlist_added')),
  metadata JSONB DEFAULT '{}'
);

-- Create campus_carbon_impact table for campus-wide statistics
CREATE TABLE public.campus_carbon_impact (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_co2_saved_kg DECIMAL(12,4) DEFAULT 0,
  total_water_saved_liters DECIMAL(12,2) DEFAULT 0,
  total_waste_diverted_kg DECIMAL(12,4) DEFAULT 0,
  total_trades_completed INTEGER DEFAULT 0,
  total_items_traded INTEGER DEFAULT 0,
  active_traders_count INTEGER DEFAULT 0
);

-- Insert default carbon footprint data for common categories
INSERT INTO public.carbon_footprint_categories (category, subcategory, kg_co2_per_item, manufacturing_emissions, transportation_emissions, disposal_emissions, water_usage_liters, description) VALUES
-- Clothing Categories
('Clothing', 'Tops', 25.5, 20.0, 3.0, 2.5, 2700, 'T-shirts, blouses, sweaters'),
('Clothing', 'Bottoms', 28.3, 22.0, 3.5, 2.8, 3000, 'Jeans, pants, shorts'),
('Clothing', 'Dresses', 35.2, 28.0, 4.0, 3.2, 3500, 'Dresses, skirts'),
('Clothing', 'Outerwear', 45.8, 35.0, 5.0, 5.8, 4500, 'Jackets, coats, hoodies'),
('Clothing', 'Athletic Wear', 22.1, 18.0, 2.5, 1.6, 2500, 'Sports clothing, gym wear'),
('Clothing', 'Formal Wear', 52.3, 40.0, 6.0, 6.3, 5000, 'Suits, formal dresses'),
('Clothing', 'Accessories', 8.5, 6.0, 1.0, 1.5, 800, 'Bags, belts, jewelry'),

-- Electronics Categories
('Electronics', 'Computers', 350.0, 280.0, 45.0, 25.0, 15000, 'Laptops, desktops, tablets'),
('Electronics', 'Phones', 85.0, 65.0, 12.0, 8.0, 3500, 'Smartphones, accessories'),
('Electronics', 'Audio', 45.0, 35.0, 6.0, 4.0, 2000, 'Headphones, speakers'),
('Electronics', 'Gaming', 120.0, 90.0, 15.0, 15.0, 5000, 'Gaming consoles, controllers'),
('Electronics', 'Accessories', 15.0, 10.0, 2.0, 3.0, 800, 'Chargers, cables, cases'),

-- Books Categories
('Books', 'Textbooks', 8.2, 6.0, 1.5, 0.7, 1200, 'Academic textbooks'),
('Books', 'Fiction', 3.5, 2.5, 0.6, 0.4, 500, 'Novels, literature'),
('Books', 'Non-Fiction', 4.2, 3.0, 0.7, 0.5, 600, 'Reference books, guides'),
('Books', 'Study Guides', 2.8, 2.0, 0.4, 0.4, 400, 'Study materials, workbooks'),

-- Dorm Items Categories
('Dorm Items', 'Storage', 18.5, 15.0, 2.0, 1.5, 1500, 'Storage boxes, organizers'),
('Dorm Items', 'Decor', 12.3, 10.0, 1.5, 0.8, 1000, 'Wall art, decorative items'),
('Dorm Items', 'Bedding', 35.0, 28.0, 4.0, 3.0, 3000, 'Sheets, blankets, pillows'),
('Dorm Items', 'Kitchen', 25.0, 20.0, 3.0, 2.0, 2000, 'Kitchen appliances, utensils'),
('Dorm Items', 'Furniture', 85.0, 65.0, 12.0, 8.0, 6000, 'Desks, chairs, lamps'),

-- School Supplies Categories
('School Supplies', 'Writing Tools', 2.1, 1.5, 0.3, 0.3, 200, 'Pens, pencils, markers'),
('School Supplies', 'Notebooks', 4.5, 3.5, 0.6, 0.4, 600, 'Notebooks, binders'),
('School Supplies', 'Bags', 15.0, 12.0, 2.0, 1.0, 1200, 'Backpacks, messenger bags'),
('School Supplies', 'Calculators', 12.0, 8.0, 2.0, 2.0, 800, 'Scientific calculators'),

-- Sports & Recreation Categories
('Sports & Recreation', 'Equipment', 45.0, 35.0, 6.0, 4.0, 3000, 'Sports equipment, gear'),
('Sports & Recreation', 'Clothing', 22.1, 18.0, 2.5, 1.6, 2500, 'Sports clothing'),
('Sports & Recreation', 'Shoes', 30.5, 25.0, 3.0, 2.5, 3500, 'Athletic shoes, sneakers'),
('Sports & Recreation', 'Accessories', 8.5, 6.0, 1.0, 1.5, 800, 'Sports accessories'),
('Sports & Recreation', 'Games', 18.0, 15.0, 2.0, 1.0, 1500, 'Board games, cards');

-- Enable RLS for new tables
ALTER TABLE public.carbon_footprint_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_carbon_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_carbon_impact ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view carbon footprint categories" ON public.carbon_footprint_categories FOR SELECT USING (true);

CREATE POLICY "Users can view their own carbon savings" ON public.user_carbon_savings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert carbon savings" ON public.user_carbon_savings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view campus carbon impact" ON public.campus_carbon_impact FOR SELECT USING (true);
CREATE POLICY "System can update campus carbon impact" ON public.campus_carbon_impact FOR UPDATE USING (true);

-- Create indexes for performance
CREATE INDEX idx_user_carbon_savings_user_id ON public.user_carbon_savings(user_id);
CREATE INDEX idx_user_carbon_savings_item_id ON public.user_carbon_savings(item_id);
CREATE INDEX idx_user_carbon_savings_created_at ON public.user_carbon_savings(created_at);
CREATE INDEX idx_carbon_footprint_categories_category ON public.carbon_footprint_categories(category, subcategory);

-- Create function to calculate carbon savings when a trade is completed
CREATE OR REPLACE FUNCTION public.calculate_trade_carbon_savings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_category RECORD;
  carbon_saved DECIMAL(10,4);
  water_saved DECIMAL(10,2);
  waste_diverted DECIMAL(10,4);
BEGIN
  -- Only calculate when trade is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Get carbon footprint data for the item
    SELECT 
      cfc.kg_co2_per_item,
      cfc.water_usage_liters,
      cfc.kg_co2_per_item * 0.8 as waste_diverted -- Assume 80% of emissions saved by trading
    INTO item_category
    FROM public.items i
    LEFT JOIN public.carbon_footprint_categories cfc 
      ON cfc.category = i.category 
      AND (cfc.subcategory = i.subcategory OR (cfc.subcategory IS NULL AND i.subcategory IS NULL))
    WHERE i.id = NEW.item_id;
    
    -- Calculate savings (use default values if no category found)
    carbon_saved := COALESCE(item_category.kg_co2_per_item, 20.0);
    water_saved := COALESCE(item_category.water_usage_liters, 2000.0);
    waste_diverted := COALESCE(item_category.waste_diverted, 16.0);
    
    -- Insert carbon savings record
    INSERT INTO public.user_carbon_savings (
      user_id, item_id, trade_id, co2_saved_kg, water_saved_liters, 
      waste_diverted_kg, savings_type
    ) VALUES (
      NEW.from_user_id, NEW.item_id, NEW.id, carbon_saved, water_saved, waste_diverted, 'trade_completed'
    );
    
    -- Update campus carbon impact
    UPDATE public.campus_carbon_impact SET
      total_co2_saved_kg = total_co2_saved_kg + carbon_saved,
      total_water_saved_liters = total_water_saved_liters + water_saved,
      total_waste_diverted_kg = total_waste_diverted_kg + waste_diverted,
      total_trades_completed = total_trades_completed + 1,
      total_items_traded = total_items_traded + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for trade completion
DROP TRIGGER IF EXISTS trigger_calculate_trade_carbon_savings ON public.trade_requests;
CREATE TRIGGER trigger_calculate_trade_carbon_savings
  AFTER UPDATE ON public.trade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_trade_carbon_savings();

-- Initialize campus carbon impact record
INSERT INTO public.campus_carbon_impact (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;
