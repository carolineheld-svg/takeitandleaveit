# User Deletion Guide

This guide explains how to delete users from the database using the updated RLS policies and functions.

## Overview

The database now includes comprehensive user deletion functionality with:
- Complete RLS policies for all tables
- Admin policies for service role operations
- Safe user deletion function with proper cascading
- User statistics function for pre-deletion analysis

## New RLS Policies Added

### User Deletion Policies
- `Users can delete their own profile` - Allows users to delete their own profile
- `Users can delete their own outgoing trade requests` - Users can delete trade requests they sent
- `Users can delete trade requests they received` - Users can delete trade requests they received
- `Users can delete their own chat messages` - Users can delete their own chat messages
- `Users can delete their own notifications` - Users can delete their own notifications
- `Users can delete their own carbon savings` - Users can delete their own carbon footprint data

### Admin Policies (Service Role)
All tables now have admin policies that allow the service role to:
- View all records
- Update any record
- Delete any record

## New Functions

### 1. `delete_user_account(user_id_to_delete UUID)`
Safely deletes a user and all their associated data in the correct order.

**Usage:**
```sql
SELECT public.delete_user_account('user-uuid-here');
```

**What it deletes (in order):**
1. Notifications
2. Wishlist items
3. User preferences
4. Carbon savings
5. Chat messages (where user is sender)
6. Trade requests (where user is involved)
7. Updates items traded to this user (sets traded_to_user_id to NULL)
8. Items owned by user
9. User profile (cascades to auth.users)

### 2. `get_user_stats(user_id_to_check UUID)`
Gets statistics about a user's data before deletion.

**Usage:**
```sql
SELECT * FROM public.get_user_stats('user-uuid-here');
```

**Returns:**
- `items_count` - Number of items listed by the user
- `trade_requests_sent` - Number of trade requests sent
- `trade_requests_received` - Number of trade requests received
- `chat_messages_count` - Number of chat messages sent
- `notifications_count` - Number of notifications
- `wishlist_items_count` - Number of wishlist items
- `carbon_savings_count` - Number of carbon savings records

## How to Apply the Updates

### Option 1: Run the Complete Schema (Recommended for New Installations)
```bash
# In Supabase SQL Editor, run the entire updated schema.sql file
```

### Option 2: Run Just the New Policies (For Existing Installations)
```bash
# In Supabase SQL Editor, run the user_deletion_policies.sql file
```

## Usage Examples

### Check User Statistics Before Deletion
```sql
-- Get statistics for a user before deletion
SELECT * FROM public.get_user_stats('123e4567-e89b-12d3-a456-426614174000');
```

### Delete a User Account
```sql
-- Delete a user and all their data
SELECT public.delete_user_account('123e4567-e89b-12d3-a456-426614174000');
```

### Admin Operations (Service Role Required)
```sql
-- View all users
SELECT * FROM public.profiles;

-- Delete a specific item
DELETE FROM public.items WHERE id = 'item-uuid-here';

-- Delete a specific trade request
DELETE FROM public.trade_requests WHERE id = 'trade-request-uuid-here';
```

## Security Notes

1. **Service Role Required**: Admin operations require the service role (`auth.role() = 'service_role'`)
2. **User Deletion Function**: Only accessible by service role
3. **Cascading Deletes**: The deletion function handles foreign key constraints properly
4. **Data Integrity**: All related data is cleaned up when a user is deleted

## Error Handling

The `delete_user_account` function will:
- Check if the user exists before attempting deletion
- Raise an exception if the user doesn't exist
- Provide a success notice when deletion completes
- Handle foreign key constraints properly

## Testing

Before using in production, test with:
1. Create a test user with various data
2. Check user statistics
3. Delete the user
4. Verify all data is removed

## Rollback

If you need to rollback these changes:
1. Drop the new functions
2. Drop the new policies
3. Restore from backup if needed

```sql
-- Drop functions
DROP FUNCTION IF EXISTS public.delete_user_account(UUID);
DROP FUNCTION IF EXISTS public.get_user_stats(UUID);

-- Drop policies (example for profiles)
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete any profile" ON public.profiles;
```
