# Notifications System Setup

This guide explains how to set up the new notifications system, wishlist, and recommendations features.

## Database Migration

1. **Run the notifications migration**:
   - Go to your Supabase dashboard
   - Navigate to the SQL Editor
   - Copy and paste the contents of `supabase/notifications_migration.sql`
   - Run the migration

   This will create:
   - `notifications` table for storing user notifications
   - `wishlist` table for user wishlists
   - `user_preferences` table for recommendation system
   - RLS policies for security
   - Database triggers for automatic notifications
   - Realtime subscriptions for live updates

## New Features Added

### 1. Real-time Notifications System
- **Notification Bell**: Located in the navigation bar, shows unread notification count
- **Real-time Updates**: Notifications appear instantly when events occur
- **Browser Push Notifications**: Native browser notifications (with user permission)
- **Notification Types**:
  - Chat messages
  - Trade requests
  - Trade accepted/declined
  - Item sold/purchased
  - Recommendations

### 2. Wishlist System
- **Wishlist Button**: Heart icon on item cards to add/remove from wishlist
- **Wishlist Page**: Dedicated page to view all saved items
- **Persistent Storage**: Items remain in wishlist across sessions

### 3. Recommendation System
- **Personalized Recommendations**: Based on user preferences and activity
- **Homepage Integration**: Recommendations section on the main page
- **Smart Filtering**: Avoids recommending user's own items or already wishlisted items

## Features Overview

### Notification Bell Component
- Real-time notification updates using Supabase Realtime
- Unread notification count badge
- Dropdown with notification history
- Mark as read functionality
- Browser push notification support

### Wishlist Functionality
- Add/remove items from wishlist
- View all wishlisted items on dedicated page
- Integration with item browsing
- Persistent across user sessions

### Recommendation Engine
- Analyzes user preferences (categories, brands, sizes)
- Learns from browsing history and wishlist activity
- Provides personalized item suggestions
- Updates recommendations based on user activity

## Automatic Notifications

The system automatically creates notifications for:

1. **Trade Requests**: When someone sends a trade request
2. **Trade Status Changes**: When trade requests are accepted or declined
3. **Chat Messages**: When new messages are sent in trade conversations
4. **Trade Completion**: When items are successfully traded
5. **Recommendations**: Periodic recommendations based on user activity

## Browser Push Notifications

- Users can grant permission for browser notifications
- Notifications appear even when the app is not in focus
- Clicking notifications navigates to relevant pages
- Auto-dismiss after 5 seconds

## User Experience Improvements

1. **Real-time Updates**: No need to refresh pages to see new notifications
2. **Persistent Wishlist**: Save items for later viewing
3. **Personalized Experience**: Recommendations tailored to user preferences
4. **Better Communication**: Instant notifications for trade-related activities
5. **Enhanced Navigation**: Quick access to important features

## Technical Implementation

- **Supabase Realtime**: Powers real-time notification updates
- **Database Triggers**: Automatically create notifications on events
- **Service Worker Ready**: Prepared for offline notification support
- **TypeScript**: Full type safety for all new features
- **Error Handling**: Graceful fallbacks if notifications fail

## Usage

### For Users
1. **Notifications**: Click the bell icon to view notifications
2. **Wishlist**: Click the heart icon on items to add to wishlist
3. **Recommendations**: View personalized suggestions on the homepage
4. **Browser Notifications**: Grant permission when prompted for push notifications

### For Developers
- All new functions are in `src/lib/database.ts`
- Notification service in `src/lib/notifications.ts`
- Components in `src/components/notifications/` and `src/components/wishlist/`
- Database schema in `supabase/notifications_migration.sql`

## Next Steps

The system is now ready for use! Users will start receiving notifications as they interact with the platform, and the recommendation system will learn from their behavior to provide better suggestions over time.
