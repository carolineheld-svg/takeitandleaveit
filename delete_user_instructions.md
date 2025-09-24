# How to Delete the meow@cate.org User

The 500 Internal Server Error occurs because the user has data in your database tables that needs to be cleaned up before the auth user can be deleted.

## Step 1: Check User Statistics First

In your Supabase SQL Editor, run this query to see what data the user has:

```sql
SELECT * FROM public.get_user_stats('736e77dd-c3c5-460a-9293-36f58ce67125');
```

This will show you:
- How many items they've listed
- How many trade requests they've sent/received
- How many chat messages they've sent
- How many notifications they have
- How many wishlist items they have
- How many carbon savings records they have

## Step 2: Delete the User Using the Database Function

Once you've checked the stats, use the safe deletion function:

```sql
SELECT public.delete_user_account('736e77dd-c3c5-460a-9293-36f58ce67125');
```

This function will:
1. Delete all their notifications
2. Delete all their wishlist items
3. Delete their user preferences
4. Delete their carbon savings records
5. Delete their chat messages
6. Delete their trade requests
7. Update any items traded to them (set traded_to_user_id to NULL)
8. Delete all items they've listed
9. Delete their profile (which will cascade to auth.users)

## Step 3: Verify Deletion

After running the deletion function, verify the user is gone:

```sql
-- Check if profile still exists
SELECT * FROM public.profiles WHERE id = '736e77dd-c3c5-460a-9293-36f58ce67125';

-- Check if any data remains
SELECT COUNT(*) as items_count FROM public.items WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
SELECT COUNT(*) as trade_requests_count FROM public.trade_requests WHERE from_user_id = '736e77dd-c3c5-460a-9293-36f58ce67125' OR to_user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
```

## Why the Auth API Failed

The Supabase Auth API deletion failed because:
1. The user has data in your custom tables (items, trade_requests, etc.)
2. These tables have foreign key references to the user
3. The auth API doesn't know about your custom tables and their relationships
4. The deletion fails due to foreign key constraints

## Alternative: Manual Cleanup (if function fails)

If for some reason the function doesn't work, you can manually delete the data:

```sql
-- Delete in this specific order:
DELETE FROM public.notifications WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.wishlist WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.user_preferences WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.user_carbon_savings WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.chat_messages WHERE sender_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.trade_requests WHERE from_user_id = '736e77dd-c3c5-460a-9293-36f58ce67125' OR to_user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
UPDATE public.items SET traded_to_user_id = NULL WHERE traded_to_user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.items WHERE user_id = '736e77dd-c3c5-460a-9293-36f58ce67125';
DELETE FROM public.profiles WHERE id = '736e77dd-c3c5-460a-9293-36f58ce67125';
```

## Important Notes

- Always check user statistics first to understand what data will be deleted
- The deletion function is safer than manual deletion because it handles foreign key constraints properly
- After successful deletion, the user will be completely removed from both your custom tables and the auth system
- Make sure you have the correct user ID (736e77dd-c3c5-460a-9293-36f58ce67125)
