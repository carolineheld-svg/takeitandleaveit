import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          brand: string
          category: string
          subcategory: string | null
          condition: string
          size: string
          description: string
          images: string[]
          status: string
          is_traded: boolean
          traded_at: string | null
          traded_to_user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          brand: string
          category: string
          subcategory?: string | null
          condition: string
          size: string
          description: string
          images: string[]
          status?: string
          is_traded?: boolean
          traded_at?: string | null
          traded_to_user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          brand?: string
          category?: string
          subcategory?: string | null
          condition?: string
          size?: string
          description?: string
          images?: string[]
          status?: string
          is_traded?: boolean
          traded_at?: string | null
          traded_to_user_id?: string | null
        }
      }
      trade_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          from_user_id: string
          to_user_id: string
          item_id: string
          status: 'pending' | 'accepted' | 'declined' | 'completed'
          message: string | null
          meeting_location: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          from_user_id: string
          to_user_id: string
          item_id: string
          status?: 'pending' | 'accepted' | 'declined' | 'completed'
          message?: string | null
          meeting_location?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          from_user_id?: string
          to_user_id?: string
          item_id?: string
          status?: 'pending' | 'accepted' | 'declined' | 'completed'
          message?: string | null
          meeting_location?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          trade_request_id: string
          sender_id: string
          message: string
          is_read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          trade_request_id: string
          sender_id: string
          message: string
          is_read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          trade_request_id?: string
          sender_id?: string
          message?: string
          is_read?: boolean
        }
      }
      campus_locations: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
        campus_impact: {
          Row: {
            id: string
            created_at: string
            total_items_traded: number
            total_users_participating: number
            last_updated: string
          }
          Insert: {
            id?: string
            created_at?: string
            total_items_traded?: number
            total_users_participating?: number
            last_updated?: string
          }
          Update: {
            id?: string
            created_at?: string
            total_items_traded?: number
            total_users_participating?: number
            last_updated?: string
          }
        }
        notifications: {
          Row: {
            id: string
            created_at: string
            user_id: string
            type: 'chat_message' | 'trade_request' | 'trade_accepted' | 'trade_declined' | 'item_sold' | 'item_bought' | 'recommendation'
            title: string
            message: string
            is_read: boolean
            read_at: string | null
            related_item_id: string | null
            related_trade_request_id: string | null
            related_chat_message_id: string | null
            action_url: string | null
            metadata: any
          }
          Insert: {
            id?: string
            created_at?: string
            user_id: string
            type: 'chat_message' | 'trade_request' | 'trade_accepted' | 'trade_declined' | 'item_sold' | 'item_bought' | 'recommendation'
            title: string
            message: string
            is_read?: boolean
            read_at?: string | null
            related_item_id?: string | null
            related_trade_request_id?: string | null
            related_chat_message_id?: string | null
            action_url?: string | null
            metadata?: any
          }
          Update: {
            id?: string
            created_at?: string
            user_id?: string
            type?: 'chat_message' | 'trade_request' | 'trade_accepted' | 'trade_declined' | 'item_sold' | 'item_bought' | 'recommendation'
            title?: string
            message?: string
            is_read?: boolean
            read_at?: string | null
            related_item_id?: string | null
            related_trade_request_id?: string | null
            related_chat_message_id?: string | null
            action_url?: string | null
            metadata?: any
          }
        }
        wishlist: {
          Row: {
            id: string
            created_at: string
            user_id: string
            item_id: string
          }
          Insert: {
            id?: string
            created_at?: string
            user_id: string
            item_id: string
          }
          Update: {
            id?: string
            created_at?: string
            user_id?: string
            item_id?: string
          }
        }
        user_preferences: {
          Row: {
            id: string
            created_at: string
            updated_at: string
            user_id: string
            favorite_categories: string[]
            favorite_brands: string[]
            preferred_sizes: string[]
            browsing_history: any
            last_recommendation_update: string
          }
          Insert: {
            id?: string
            created_at?: string
            updated_at?: string
            user_id: string
            favorite_categories?: string[]
            favorite_brands?: string[]
            preferred_sizes?: string[]
            browsing_history?: any
            last_recommendation_update?: string
          }
          Update: {
            id?: string
            created_at?: string
            updated_at?: string
            user_id?: string
            favorite_categories?: string[]
            favorite_brands?: string[]
            preferred_sizes?: string[]
            browsing_history?: any
            last_recommendation_update?: string
          }
        }
    }
  }
}
