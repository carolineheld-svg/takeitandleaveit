import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'

// Create a singleton client instance for consistent session handling
const supabase = createClient()

export type Item = Database['public']['Tables']['items']['Row']
type ItemInsert = Database['public']['Tables']['items']['Insert']
type ItemUpdate = Database['public']['Tables']['items']['Update']

type TradeRequest = Database['public']['Tables']['trade_requests']['Row']
type TradeRequestInsert = Database['public']['Tables']['trade_requests']['Insert']
type TradeRequestUpdate = Database['public']['Tables']['trade_requests']['Update']

type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']

type DirectMessage = Database['public']['Tables']['direct_messages']['Row']
type DirectMessageInsert = Database['public']['Tables']['direct_messages']['Insert']

type Profile = Database['public']['Tables']['profiles']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Items
export async function createItem(item: Omit<ItemInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create item: ${error.message}`)
  }

  return data
}

export async function getItems(): Promise<(Item & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_traded', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`)
  }

  return data || []
}

export async function getItemById(id: string): Promise<(Item & { profiles: Profile }) | null> {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Item not found
    }
    throw new Error(`Failed to fetch item: ${error.message}`)
  }

  return data
}

export async function updateItem(id: string, updates: ItemUpdate): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`)
  }

  return data
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

export async function getItemsByUser(userId: string): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user items: ${error.message}`)
  }

  return data || []
}

// Trade Requests
export async function createTradeRequest(request: Omit<TradeRequestInsert, 'id' | 'created_at' | 'updated_at'>): Promise<TradeRequest> {
  const { data, error } = await supabase
    .from('trade_requests')
    .insert(request)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create trade request: ${error.message}`)
  }

  // Create notification for the item owner
  try {
    await createNotification({
      user_id: request.to_user_id,
      type: 'trade_request',
      title: 'New Trade Request',
      message: `You received a new trade request for your item.`,
      is_read: false,
      read_at: null,
      related_item_id: request.item_id,
      related_trade_request_id: data.id,
      related_chat_message_id: null,
      action_url: '/trades',
      metadata: {}
    })
  } catch (notificationError) {
    console.error('Failed to create trade request notification:', notificationError)
    // Don't fail the trade request if notification fails
  }

  return data
}

export async function getTradeRequestsForUser(userId: string): Promise<(TradeRequest & { 
  items: Item & { profiles: Profile },
  profiles: Profile 
})[]> {
  const { data, error } = await supabase
    .from('trade_requests')
    .select(`
      *,
      items:item_id (
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      ),
      profiles:from_user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch trade requests: ${error.message}`)
  }

  return data || []
}

export async function updateTradeRequest(id: string, updates: TradeRequestUpdate): Promise<TradeRequest> {
  const { data, error } = await supabase
    .from('trade_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update trade request: ${error.message}`)
  }

  // Create notifications for status changes
  try {
    if (updates.status === 'accepted') {
      await createNotification({
        user_id: data.from_user_id,
        type: 'trade_accepted',
        title: 'Trade Request Accepted',
        message: `Your trade request has been accepted! You can now coordinate the exchange.`,
        is_read: false,
        read_at: null,
        related_item_id: data.item_id,
        related_trade_request_id: data.id,
        related_chat_message_id: null,
        action_url: '/trades',
        metadata: {}
      })
    } else if (updates.status === 'declined') {
      await createNotification({
        user_id: data.from_user_id,
        type: 'trade_declined',
        title: 'Trade Request Declined',
        message: `Your trade request has been declined.`,
        is_read: false,
        read_at: null,
        related_item_id: data.item_id,
        related_trade_request_id: data.id,
        related_chat_message_id: null,
        action_url: '/trades',
        metadata: {}
      })
    }
  } catch (notificationError) {
    console.error('Failed to create trade status notification:', notificationError)
    // Don't fail the trade request update if notification fails
  }

  return data
}

// Chat Messages
export async function getChatMessages(tradeRequestId: string): Promise<(ChatMessage & { profiles: Profile })[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      profiles:sender_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('trade_request_id', tradeRequestId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch chat messages: ${error.message}`)
  }

  return data || []
}

export async function createChatMessage(message: Omit<ChatMessageInsert, 'id' | 'created_at'>): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(message)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create chat message: ${error.message}`)
  }

  // Get trade request to find the recipient
  try {
    const { data: tradeRequest } = await supabase
      .from('trade_requests')
      .select('from_user_id, to_user_id')
      .eq('id', message.trade_request_id)
      .single()

    if (tradeRequest) {
      // Create notification for the recipient (not the sender)
      const recipientId = tradeRequest.from_user_id === message.sender_id 
        ? tradeRequest.to_user_id 
        : tradeRequest.from_user_id

      await createNotification({
        user_id: recipientId,
        type: 'chat_message',
        title: 'New Message',
        message: `You received a new message about your trade.`,
        is_read: false,
        read_at: null,
        related_item_id: tradeRequest.item_id,
        related_trade_request_id: message.trade_request_id,
        related_chat_message_id: data.id,
        action_url: '/trades',
        metadata: {}
      })
    }
  } catch (notificationError) {
    console.error('Failed to create chat message notification:', notificationError)
    // Don't fail the chat message if notification fails
  }

  return data
}

// Profiles
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Profile not found
    }
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return data
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return data
}

// Notifications
export async function createNotification(notification: Omit<NotificationInsert, 'id' | 'created_at'>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return data
}

export async function getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  return data || []
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', notificationId)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`)
  }
}

// Wishlist functions
export async function addToWishlist(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .insert({ user_id: userId, item_id: itemId })

  if (error) {
    throw new Error(`Failed to add to wishlist: ${error.message}`)
  }
}

export async function removeFromWishlist(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId)

  if (error) {
    throw new Error(`Failed to remove from wishlist: ${error.message}`)
  }
}

export async function getWishlist(userId: string): Promise<(Database['public']['Tables']['wishlist']['Row'] & { items: Item & { profiles: Profile } })[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      *,
      items:item_id (
        *,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch wishlist: ${error.message}`)
  }

  return data || []
}

// Recommendation functions
export async function getRecommendedItems(userId: string, limit: number = 6): Promise<(Item & { profiles: Profile })[]> {
  // Get user preferences
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get user's wishlist to avoid recommending items they already want
  const { data: wishlist } = await supabase
    .from('wishlist')
    .select('item_id')
    .eq('user_id', userId)

  const wishlistIds = wishlist?.map((w: { item_id: string }) => w.item_id) || []

  // Build query based on preferences
  let query = supabase
    .from('items')
    .select(`
      *,
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('is_traded', false)
    .neq('user_id', userId) // Don't recommend user's own items
    .not('id', 'in', `(${wishlistIds.join(',')})`) // Don't recommend wishlisted items

  // Apply filters based on user preferences
  if (preferences?.favorite_categories?.length > 0) {
    query = query.in('category', preferences.favorite_categories)
  }
  
  if (preferences?.favorite_brands?.length > 0) {
    query = query.in('brand', preferences.favorite_brands)
  }

  if (preferences?.preferred_sizes?.length > 0) {
    query = query.in('size', preferences.preferred_sizes)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recommended items: ${error.message}`)
  }

  return data || []
}

export async function updateUserPreferences(userId: string, updates: {
  favorite_categories?: string[]
  favorite_brands?: string[]
  preferred_sizes?: string[]
  browsing_history?: Record<string, unknown>
}): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
      last_recommendation_update: new Date().toISOString()
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    })

  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`)
  }
}

// Trade completion with notifications
export async function completeTrade(tradeRequestId: string): Promise<void> {
  // Call the database function to complete the trade
  const { error } = await supabase.rpc('complete_trade', {
    trade_request_id: tradeRequestId
  })

  if (error) {
    throw new Error(`Failed to complete trade: ${error.message}`)
  }

  // Get trade request details for notifications
  try {
    const { data: tradeRequest } = await supabase
      .from('trade_requests')
      .select(`
        *,
        items:item_id (
          name,
          user_id
        )
      `)
      .eq('id', tradeRequestId)
      .single()

    if (tradeRequest) {
      // Create notifications for both parties
      await Promise.all([
        // Notification for the item owner (item sold)
        createNotification({
          user_id: tradeRequest.to_user_id,
          type: 'item_sold',
          title: 'Item Successfully Traded',
          message: `Your item "${tradeRequest.items.name}" has been successfully traded!`,
          is_read: false,
          read_at: null,
          related_item_id: tradeRequest.item_id,
          related_trade_request_id: tradeRequestId,
          related_chat_message_id: null,
          action_url: '/profile',
          metadata: {}
        }),
        // Notification for the buyer (item bought)
        createNotification({
          user_id: tradeRequest.from_user_id,
          type: 'item_bought',
          title: 'Trade Completed',
          message: `You successfully traded for "${tradeRequest.items.name}"!`,
          is_read: false,
          read_at: null,
          related_item_id: tradeRequest.item_id,
          related_trade_request_id: tradeRequestId,
          related_chat_message_id: null,
          action_url: '/profile',
          metadata: {}
        })
      ])
    }
  } catch (notificationError) {
    console.error('Failed to create trade completion notifications:', notificationError)
    // Don't fail the trade completion if notifications fail
  }
}

// Direct Messages
export async function sendDirectMessage(message: Omit<DirectMessageInsert, 'id' | 'created_at'>): Promise<DirectMessage> {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert(message)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to send direct message: ${error.message}`)
  }

  // Create notification for the recipient
  try {
    // Get item name if item_id is provided
    let itemName = 'an item'
    if (message.item_id) {
      const { data: item } = await supabase
        .from('items')
        .select('name')
        .eq('id', message.item_id)
        .single()
      
      if (item) {
        itemName = item.name
      }
    }

    await createNotification({
      user_id: message.recipient_id,
      type: 'chat_message',
      title: 'New Message',
      message: `You received a new message${message.item_id ? ` about ${itemName}` : ''}.`,
      is_read: false,
      read_at: null,
      related_item_id: message.item_id || null,
      related_trade_request_id: null,
      related_chat_message_id: null,
      action_url: '/messages',
      metadata: {}
    })
  } catch (notificationError) {
    console.error('Failed to create direct message notification:', notificationError)
  }

  return data
}

export async function getDirectMessages(userId: string, otherUserId: string, itemId?: string): Promise<(DirectMessage & { profiles: Profile })[]> {
  let query = supabase
    .from('direct_messages')
    .select(`
      *,
      profiles:sender_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true })

  if (itemId) {
    query = query.eq('item_id', itemId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch direct messages: ${error.message}`)
  }

  return data || []
}

type DirectMessageWithProfiles = DirectMessage & {
  sender_profile: Profile
  recipient_profile: Profile
  items?: { id: string; name: string; images: string[] } | null
}

export async function getDirectMessageConversations(userId: string): Promise<{
  otherUserId: string
  otherUser: Profile
  latestMessage: DirectMessage
  unreadCount: number
  item?: { id: string; name: string; images: string[] }
}[]> {
  // Get all messages involving this user
  const { data: messages, error } = await supabase
    .from('direct_messages')
    .select(`
      *,
      sender_profile:sender_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      recipient_profile:recipient_id (
        id,
        username,
        full_name,
        avatar_url
      ),
      items:item_id (
        id,
        name,
        images
      )
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`)
  }

  if (!messages || messages.length === 0) {
    return []
  }

  // Group messages by conversation (sender + recipient pair + item)
  const conversationMap = new Map<string, DirectMessageWithProfiles[]>()

  messages.forEach((msg: DirectMessageWithProfiles) => {
    const otherUserId = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
    const key = `${otherUserId}-${msg.item_id || 'general'}`
    
    if (!conversationMap.has(key)) {
      conversationMap.set(key, [])
    }
    conversationMap.get(key)!.push(msg)
  })

  // Build conversation list
  const conversations: {
    otherUserId: string
    otherUser: Profile
    latestMessage: DirectMessage
    unreadCount: number
    item?: { id: string; name: string; images: string[] }
  }[] = []

  conversationMap.forEach((msgs) => {
    const latestMsg = msgs[0]
    const otherUserId = latestMsg.sender_id === userId ? latestMsg.recipient_id : latestMsg.sender_id
    const otherUser = latestMsg.sender_id === userId ? latestMsg.recipient_profile : latestMsg.sender_profile
    
    const unreadCount = msgs.filter((m: DirectMessageWithProfiles) => 
      m.recipient_id === userId && !m.is_read
    ).length

    conversations.push({
      otherUserId,
      otherUser,
      latestMessage: latestMsg,
      unreadCount,
      item: latestMsg.items || undefined
    })
  })

  return conversations
}

export async function markDirectMessageAsRead(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('direct_messages')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('id', messageId)

  if (error) {
    throw new Error(`Failed to mark direct message as read: ${error.message}`)
  }
}

export async function markAllDirectMessagesAsRead(userId: string, otherUserId: string, itemId?: string): Promise<void> {
  let query = supabase
    .from('direct_messages')
    .update({ 
      is_read: true, 
      read_at: new Date().toISOString() 
    })
    .eq('recipient_id', userId)
    .eq('sender_id', otherUserId)
    .eq('is_read', false)

  if (itemId) {
    query = query.eq('item_id', itemId)
  }

  const { error } = await query

  if (error) {
    throw new Error(`Failed to mark direct messages as read: ${error.message}`)
  }
}
