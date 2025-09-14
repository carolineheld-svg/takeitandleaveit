# Database Update Instructions

## Error Fix: Missing 'category' Column

You're getting this error because your database schema hasn't been updated with the new columns we added. Here's how to fix it:

## Option 1: Run the Migration Script (Recommended)

1. **Go to your Supabase Dashboard**
   - Open your project at https://supabase.com/dashboard
   - Navigate to the "SQL Editor" tab

2. **Copy and paste the migration script**
   - Open the file `supabase/migration.sql` in this project
   - Copy the entire contents
   - Paste it into the SQL Editor in Supabase

3. **Run the script**
   - Click "Run" to execute the migration
   - This will add the missing columns safely

## Option 2: Manual Column Addition

If you prefer to add columns manually:

```sql
-- Add the missing columns
ALTER TABLE public.items 
ADD COLUMN category TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN subcategory TEXT,
ADD COLUMN status TEXT DEFAULT 'available';

-- Add constraints
ALTER TABLE public.items 
ADD CONSTRAINT items_condition_check 
CHECK (condition IN ('Excellent', 'Decent', 'So-so', 'Poor'));

ALTER TABLE public.items 
ADD CONSTRAINT items_status_check 
CHECK (status IN ('available', 'pending', 'traded'));
```

## What the Migration Does

- ✅ Adds `category` column (required)
- ✅ Adds `subcategory` column (optional)
- ✅ Adds `status` column with default 'available'
- ✅ Updates condition constraint to new values
- ✅ Creates campus_locations table
- ✅ Creates campus_impact table
- ✅ Adds meeting_location to trade_requests
- ✅ Sets existing items to category 'Other' by default

## After Running the Migration

1. **Test the list item functionality** - Try creating a new item
2. **Verify the browse page** - Check that categories and filters work
3. **Check the database** - Verify columns exist in your items table

## Troubleshooting

If you still get errors:
1. Make sure you're running the SQL in the correct Supabase project
2. Check that you have the right permissions (should work with the anon key)
3. Verify the migration completed successfully by checking your items table structure

The error should be resolved after running this migration! 🎉
