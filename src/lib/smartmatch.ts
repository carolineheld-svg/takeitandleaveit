// AI-powered SmartMatch recommendation system
import { createClient } from '@/lib/supabase-client'
import { CLOTHING_CATEGORIES } from '@/lib/constants'

interface UserPreferences {
  favorite_categories: string[]
  favorite_brands: string[]
  preferred_sizes: string[]
  size_preferences: Record<string, string[]>
  browsing_history: Record<string, number>
  search_history: Record<string, number>
  ai_preferences: Record<string, unknown>
  updated_at?: string
  last_recommendation_update?: string
}

interface Item {
  id: string
  name: string
  brand: string
  category: string
  subcategory: string
  condition: string
  size: string
  description: string
  images: string[]
  status: string
  user_id: string
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface SmartMatchScore {
  item: Item
  score: number
  reasons: string[]
}

export class SmartMatchAI {
  private supabase = createClient()

  // Track user activity for learning
  async trackUserActivity(userId: string, activity: {
    type: 'search' | 'browse' | 'view' | 'wishlist' | 'trade'
    category?: string
    subcategory?: string
    brand?: string
    size?: string
    searchTerm?: string
  }): Promise<void> {
    try {
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      const updates: Partial<UserPreferences> = {
        updated_at: new Date().toISOString(),
        last_recommendation_update: new Date().toISOString()
      }

      // Update search history
      if (activity.type === 'search' && activity.searchTerm) {
        const searchHistory = (preferences?.search_history as Record<string, number>) || {}
        searchHistory[activity.searchTerm.toLowerCase()] = (searchHistory[activity.searchTerm.toLowerCase()] || 0) + 1
        updates.search_history = searchHistory
      }

      // Update browsing history
      if (activity.type === 'browse' || activity.type === 'view') {
        const browsingHistory = (preferences?.browsing_history as Record<string, number>) || {}
        const key = `${activity.category || 'all'}_${activity.subcategory || 'all'}`
        browsingHistory[key] = (browsingHistory[key] || 0) + 1
        updates.browsing_history = browsingHistory
      }

      // Update AI preferences based on activity
      const aiPreferences = (preferences?.ai_preferences as Record<string, unknown>) || {}
      if (activity.category) {
        aiPreferences[`category_${activity.category}`] = (aiPreferences[`category_${activity.category}`] as number || 0) + 1
      }
      if (activity.brand) {
        aiPreferences[`brand_${activity.brand}`] = (aiPreferences[`brand_${activity.brand}`] as number || 0) + 1
      }
      if (activity.size) {
        aiPreferences[`size_${activity.size}`] = (aiPreferences[`size_${activity.size}`] as number || 0) + 1
      }
      updates.ai_preferences = aiPreferences

      await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          ...updates
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
    } catch (error) {
      console.error('Failed to track user activity:', error)
    }
  }

  // Generate AI-powered recommendations
  async generateSmartMatchRecommendations(userId: string, limit: number = 12): Promise<SmartMatchScore[]> {
    try {
      // Get user preferences
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Get user's wishlist to avoid duplicates
      const { data: wishlist } = await this.supabase
        .from('wishlist')
        .select('item_id')
        .eq('user_id', userId)

      const wishlistIds = wishlist?.map((w: { item_id: string }) => w.item_id) || []

      // Get available items (excluding user's own items and wishlisted items)
      const { data: items } = await this.supabase
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
        .neq('user_id', userId)
        .not('id', 'in', `(${wishlistIds.join(',')})`)
        .limit(100) // Get more items to score

      if (!items || items.length === 0) {
        return []
      }

      // Score each item using AI logic
      const scoredItems: SmartMatchScore[] = items.map((item: Item) => {
        const score = this.calculateSmartMatchScore(item, preferences)
        return {
          item,
          score: score.total,
          reasons: score.reasons
        }
      })

      // Sort by score and return top recommendations
      return scoredItems
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .filter(item => item.score > 0) // Only return items with positive scores

    } catch (error) {
      console.error('Failed to generate SmartMatch recommendations:', error)
      return []
    }
  }

  // Calculate SmartMatch score for an item
  private calculateSmartMatchScore(item: Item, preferences: UserPreferences | null): { total: number, reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    if (!preferences) {
      return { total: 0, reasons: ['No preferences set'] }
    }

    const aiPreferences = preferences.ai_preferences as Record<string, number> || {}
    const searchHistory = preferences.search_history as Record<string, number> || {}
    const browsingHistory = preferences.browsing_history as Record<string, number> || {}
    const sizePreferences = preferences.size_preferences as Record<string, string[]> || {}

    // Category preference scoring (40% weight)
    const categoryScore = this.getCategoryScore(item.category, item.subcategory, aiPreferences, browsingHistory)
    score += categoryScore * 0.4
    if (categoryScore > 0) {
      reasons.push(`Matches your interest in ${item.category}`)
    }

    // Brand preference scoring (25% weight)
    const brandScore = this.getBrandScore(item.brand, aiPreferences)
    score += brandScore * 0.25
    if (brandScore > 0) {
      reasons.push(`Brand ${item.brand} matches your preferences`)
    }

    // Size matching for clothing (20% weight)
    const sizeScore = this.getSizeScore(item, sizePreferences)
    score += sizeScore * 0.2
    if (sizeScore > 0) {
      reasons.push(`Size ${item.size} matches your preferences`)
    }

    // Search history relevance (10% weight)
    const searchScore = this.getSearchRelevanceScore(item, searchHistory)
    score += searchScore * 0.1
    if (searchScore > 0) {
      reasons.push('Matches your recent searches')
    }

    // Condition preference (5% weight)
    const conditionScore = this.getConditionScore(item.condition)
    score += conditionScore * 0.05
    if (conditionScore > 0) {
      reasons.push(`Excellent condition (${item.condition})`)
    }

    return { total: Math.round(score * 100) / 100, reasons }
  }

  private getCategoryScore(category: string, subcategory: string, aiPreferences: Record<string, number>, browsingHistory: Record<string, number>): number {
    let score = 0

    // Check category preference
    const categoryKey = `category_${category}`
    score += (aiPreferences[categoryKey] || 0) * 0.5

    // Check subcategory browsing history
    const browsingKey = `${category}_${subcategory}`
    score += (browsingHistory[browsingKey] || 0) * 0.3

    // Check general category browsing
    const generalKey = `${category}_all`
    score += (browsingHistory[generalKey] || 0) * 0.2

    return Math.min(score, 10) // Cap at 10
  }

  private getBrandScore(brand: string, aiPreferences: Record<string, number>): number {
    const brandKey = `brand_${brand}`
    return Math.min((aiPreferences[brandKey] || 0) * 2, 10) // Cap at 10
  }

  private getSizeScore(item: Item, _sizePreferences: Record<string, string[]>): number {
    // Only apply size scoring for clothing items
    if (!CLOTHING_CATEGORIES.includes(item.category)) {
      return 5 // Neutral score for non-clothing items
    }

    const preferredSizes = _sizePreferences[item.subcategory] || _sizePreferences[item.category] || []
    
    if (preferredSizes.includes(item.size)) {
      return 10 // Perfect match
    }

    // Check for similar sizes (e.g., S vs M)
    const sizeHierarchy = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    const itemSizeIndex = sizeHierarchy.indexOf(item.size)
    
    for (const preferredSize of preferredSizes) {
      const preferredSizeIndex = sizeHierarchy.indexOf(preferredSize)
      if (preferredSizeIndex !== -1 && Math.abs(itemSizeIndex - preferredSizeIndex) <= 1) {
        return 7 // Close match
      }
    }

    return 0 // No match
  }

  private getSearchRelevanceScore(item: Item, searchHistory: Record<string, number>): number {
    let score = 0
    const itemText = `${item.name} ${item.brand} ${item.category} ${item.subcategory} ${item.description}`.toLowerCase()

    for (const [searchTerm, count] of Object.entries(searchHistory)) {
      if (itemText.includes(searchTerm.toLowerCase())) {
        score += count * 2
      }
    }

    return Math.min(score, 10) // Cap at 10
  }

  private getConditionScore(condition: string): number {
    // Prefer better conditions
    const conditionScores = {
      'Excellent': 10,
      'Decent': 7,
      'So-so': 4,
      'Poor': 1
    }

    return conditionScores[condition as keyof typeof conditionScores] || 5
  }

  // Update user size preferences
  async updateSizePreferences(userId: string, _sizePreferences: Record<string, string[]>): Promise<void> {
    try {
      console.log('SmartMatchAI: Updating size preferences for user:', userId, _sizePreferences)
      
      // First, try to get existing preferences
      const { data: existing } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await this.supabase
          .from('user_preferences')
          .update({
            size_preferences: _sizePreferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()

        if (error) {
          console.error('Database error updating size preferences:', error)
          throw error
        }

        console.log('SmartMatchAI: Size preferences updated successfully:', data)
      } else {
        // Insert new record
        const { data, error } = await this.supabase
          .from('user_preferences')
          .insert({
            user_id: userId,
            size_preferences: _sizePreferences,
            updated_at: new Date().toISOString()
          })
          .select()

        if (error) {
          console.error('Database error inserting size preferences:', error)
          throw error
        }

        console.log('SmartMatchAI: Size preferences inserted successfully:', data)
      }
    } catch (error) {
      console.error('Failed to update size preferences:', error)
      throw error
    }
  }

  // Get user's current preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      return data as UserPreferences || null
    } catch (error) {
      console.error('Failed to get user preferences:', error)
      return null
    }
  }
}

// Export singleton instance
export const smartMatchAI = new SmartMatchAI()
