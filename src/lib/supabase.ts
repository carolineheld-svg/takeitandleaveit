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
          size: string | null
          description: string
          images: string[]
          status: string
          is_traded: boolean
          traded_at: string | null
          traded_to_user_id: string | null
          listing_type: 'free' | 'for_sale'
          price: number | null
          payment_methods: string[]
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
          size: string | null
          description: string
          images: string[]
          status?: string
          is_traded?: boolean
          traded_at?: string | null
          traded_to_user_id?: string | null
          listing_type?: 'free' | 'for_sale'
          price?: number | null
          payment_methods?: string[]
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
          listing_type?: 'free' | 'for_sale'
          price?: number | null
          payment_methods?: string[]
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
      direct_messages: {
        Row: {
          id: string
          created_at: string
          sender_id: string
          recipient_id: string
          item_id: string | null
          message: string
          is_read: boolean
          read_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          sender_id: string
          recipient_id: string
          item_id?: string | null
          message: string
          is_read?: boolean
          read_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          sender_id?: string
          recipient_id?: string
          item_id?: string | null
          message?: string
          is_read?: boolean
          read_at?: string | null
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
            metadata: Record<string, unknown>
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
            metadata?: Record<string, unknown>
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
            metadata?: Record<string, unknown>
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
            size_preferences: Record<string, unknown>
            browsing_history: Record<string, unknown>
            search_history: Record<string, unknown>
            ai_preferences: Record<string, unknown>
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
            size_preferences?: Record<string, unknown>
            browsing_history?: Record<string, unknown>
            search_history?: Record<string, unknown>
            ai_preferences?: Record<string, unknown>
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
            size_preferences?: Record<string, unknown>
            browsing_history?: Record<string, unknown>
            search_history?: Record<string, unknown>
            ai_preferences?: Record<string, unknown>
            last_recommendation_update?: string
          }
        }
        carbon_footprint_categories: {
          Row: {
            id: string
            created_at: string
            category: string
            subcategory: string | null
            kg_co2_per_item: number
            manufacturing_emissions: number
            transportation_emissions: number
            disposal_emissions: number
            water_usage_liters: number | null
            description: string | null
          }
          Insert: {
            id?: string
            created_at?: string
            category: string
            subcategory?: string | null
            kg_co2_per_item: number
            manufacturing_emissions: number
            transportation_emissions: number
            disposal_emissions: number
            water_usage_liters?: number | null
            description?: string | null
          }
          Update: {
            id?: string
            created_at?: string
            category?: string
            subcategory?: string | null
            kg_co2_per_item?: number
            manufacturing_emissions?: number
            transportation_emissions?: number
            disposal_emissions?: number
            water_usage_liters?: number | null
            description?: string | null
          }
        }
        user_carbon_savings: {
          Row: {
            id: string
            created_at: string
            user_id: string
            item_id: string
            trade_id: string | null
            co2_saved_kg: number
            water_saved_liters: number | null
            waste_diverted_kg: number | null
            savings_type: 'trade_completed' | 'item_listed' | 'wishlist_added'
            metadata: Record<string, unknown>
          }
          Insert: {
            id?: string
            created_at?: string
            user_id: string
            item_id: string
            trade_id?: string | null
            co2_saved_kg: number
            water_saved_liters?: number | null
            waste_diverted_kg?: number | null
            savings_type: 'trade_completed' | 'item_listed' | 'wishlist_added'
            metadata?: Record<string, unknown>
          }
          Update: {
            id?: string
            created_at?: string
            user_id?: string
            item_id?: string
            trade_id?: string | null
            co2_saved_kg?: number
            water_saved_liters?: number | null
            waste_diverted_kg?: number | null
            savings_type?: 'trade_completed' | 'item_listed' | 'wishlist_added'
            metadata?: Record<string, unknown>
          }
        }
        campus_carbon_impact: {
          Row: {
            id: string
            created_at: string
            updated_at: string
            total_co2_saved_kg: number
            total_water_saved_liters: number
            total_waste_diverted_kg: number
            total_trades_completed: number
            total_items_traded: number
            active_traders_count: number
          }
          Insert: {
            id?: string
            created_at?: string
            updated_at?: string
            total_co2_saved_kg?: number
            total_water_saved_liters?: number
            total_waste_diverted_kg?: number
            total_trades_completed?: number
            total_items_traded?: number
            active_traders_count?: number
          }
          Update: {
            id?: string
            created_at?: string
            updated_at?: string
            total_co2_saved_kg?: number
            total_water_saved_liters?: number
            total_waste_diverted_kg?: number
            total_trades_completed?: number
            total_items_traded?: number
            active_traders_count?: number
          }
        }
    }
  }
}
