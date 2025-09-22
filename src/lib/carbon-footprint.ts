import { createClient } from '@/lib/supabase-client'

const supabase = createClient()

export interface CarbonFootprintData {
  kg_co2_per_item: number
  manufacturing_emissions: number
  transportation_emissions: number
  disposal_emissions: number
  water_usage_liters: number
  description: string
}

export interface UserCarbonSavings {
  id: string
  created_at: string
  user_id: string
  item_id: string
  trade_id?: string
  co2_saved_kg: number
  water_saved_liters?: number
  waste_diverted_kg?: number
  savings_type: 'trade_completed' | 'item_listed' | 'wishlist_added'
}

export interface CampusCarbonImpact {
  total_co2_saved_kg: number
  total_water_saved_liters: number
  total_waste_diverted_kg: number
  total_trades_completed: number
  total_items_traded: number
  active_traders_count: number
}


export class CarbonFootprintService {
  /**
   * Get carbon footprint data for a specific category and subcategory
   */
  static async getCarbonFootprintData(
    category: string, 
    subcategory?: string
  ): Promise<CarbonFootprintData | null> {
    const { data, error } = await supabase
      .from('carbon_footprint_categories')
      .select('*')
      .eq('category', category)
      .eq('subcategory', subcategory || null)
      .single()

    if (error) {
      console.error('Error fetching carbon footprint data:', error)
      return null
    }

    return data
  }

  /**
   * Calculate carbon savings for a specific item
   */
  static async calculateItemCarbonSavings(
    category: string, 
    subcategory?: string
  ): Promise<{
    co2Saved: number
    waterSaved: number
    wasteDiverted: number
  }> {
    const footprintData = await this.getCarbonFootprintData(category, subcategory)
    
    if (!footprintData) {
      // Return default values if no specific data found
      return {
        co2Saved: 20.0,
        waterSaved: 2000.0,
        wasteDiverted: 16.0
      }
    }

    return {
      co2Saved: footprintData.kg_co2_per_item,
      waterSaved: footprintData.water_usage_liters || 2000.0,
      wasteDiverted: footprintData.kg_co2_per_item * 0.8 // Assume 80% savings
    }
  }

  /**
   * Get user's total carbon savings
   */
  static async getUserCarbonSavings(userId: string): Promise<{
    totalCo2Saved: number
    totalWaterSaved: number
    totalWasteDiverted: number
    totalTrades: number
    recentSavings: UserCarbonSavings[]
  }> {
    const { data, error } = await supabase
      .from('user_carbon_savings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user carbon savings:', error)
      return {
        totalCo2Saved: 0,
        totalWaterSaved: 0,
        totalWasteDiverted: 0,
        totalTrades: 0,
        recentSavings: []
      }
    }

    const totalCo2Saved = data.reduce((sum: number, saving: UserCarbonSavings) => sum + saving.co2_saved_kg, 0)
    const totalWaterSaved = data.reduce((sum: number, saving: UserCarbonSavings) => sum + (saving.water_saved_liters || 0), 0)
    const totalWasteDiverted = data.reduce((sum: number, saving: UserCarbonSavings) => sum + (saving.waste_diverted_kg || 0), 0)
    const totalTrades = data.filter((saving: UserCarbonSavings) => saving.savings_type === 'trade_completed').length

    return {
      totalCo2Saved,
      totalWaterSaved,
      totalWasteDiverted,
      totalTrades,
      recentSavings: data.slice(0, 10) // Last 10 savings
    }
  }

  /**
   * Get campus-wide carbon impact
   */
  static async getCampusCarbonImpact(): Promise<CampusCarbonImpact | null> {
    const { data, error } = await supabase
      .from('campus_carbon_impact')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching campus carbon impact:', error)
      return null
    }

    return data
  }


  /**
   * Format carbon savings for display
   */
  static formatCarbonSavings(co2Kg: number): {
    display: string
    description: string
    equivalent: string
  } {
    const rounded = Math.round(co2Kg * 10) / 10
    
    let description = ''
    let equivalent = ''
    
    if (co2Kg < 1) {
      description = 'Small impact'
      equivalent = '≈ 1 tree planted'
    } else if (co2Kg < 5) {
      description = 'Good impact'
      equivalent = '≈ 2-3 trees planted'
    } else if (co2Kg < 15) {
      description = 'Great impact'
      equivalent = '≈ 5-7 trees planted'
    } else if (co2Kg < 30) {
      description = 'Excellent impact'
      equivalent = '≈ 10-15 trees planted'
    } else {
      description = 'Outstanding impact'
      equivalent = '≈ 15+ trees planted'
    }

    return {
      display: `${rounded} kg CO₂`,
      description,
      equivalent
    }
  }

  /**
   * Get carbon footprint comparison data
   */
  static async getCarbonFootprintComparison(): Promise<{
    newVsUsed: { new: number; used: number }
    categories: { category: string; avgCo2: number }[]
  }> {
    // This would typically come from external data sources
    // For now, we'll use estimated values
    return {
      newVsUsed: {
        new: 25.0, // Average CO2 for new clothing item
        used: 5.0   // Average CO2 for traded item
      },
      categories: [
        { category: 'Clothing', avgCo2: 30.2 },
        { category: 'Electronics', avgCo2: 150.0 },
        { category: 'Books', avgCo2: 4.7 },
        { category: 'Dorm Items', avgCo2: 35.0 },
        { category: 'School Supplies', avgCo2: 8.5 },
        { category: 'Sports & Recreation', avgCo2: 25.0 }
      ]
    }
  }
}
