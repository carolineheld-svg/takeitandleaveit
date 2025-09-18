'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Brain, Star, TrendingUp, Package } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { smartMatchAI } from '@/lib/smartmatch'
import WishlistButton from '@/components/wishlist/WishlistButton'

interface SmartMatchItem {
  item: {
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
  score: number
  reasons: string[]
}

export default function SmartMatchSection() {
  const { user } = useAuth()
  const [smartMatchItems, setSmartMatchItems] = useState<SmartMatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const loadSmartMatchRecommendations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const recommendations = await smartMatchAI.generateSmartMatchRecommendations(user.id, 6)
      setSmartMatchItems(recommendations)
    } catch (error) {
      console.error('Failed to load SmartMatch recommendations:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadSmartMatchRecommendations()
    } else {
      setLoading(false)
    }
  }, [user, loadSmartMatchRecommendations])

  const handleItemClick = async (item: SmartMatchItem['item']) => {
    // Track user activity for AI learning
    if (user) {
      await smartMatchAI.trackUserActivity(user.id, {
        type: 'view',
        category: item.category,
        subcategory: item.subcategory,
        brand: item.brand,
        size: item.size
      })
    }
  }

  if (!user) return null

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-4xl font-coquette font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SmartMatch AI
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-powered recommendations tailored to your preferences, size, and browsing history
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-purple-600 font-coquette text-xl">AI is analyzing your preferences...</p>
          </div>
        ) : smartMatchItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-coquette font-semibold text-gray-600 mb-2">
              No SmartMatch recommendations yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start browsing items and setting your preferences to get personalized AI recommendations!
            </p>
            <Link 
              href="/browse" 
              className="btn-coquette"
            >
              Start Browsing
            </Link>
          </div>
        ) : (
          <>
            {/* SmartMatch Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <h3 className="font-coquette font-semibold text-gray-700">AI Analysis</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Analyzing your preferences, size, and browsing patterns
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-pink-200">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="w-6 h-6 text-pink-500" />
                  <h3 className="font-coquette font-semibold text-gray-700">Perfect Matches</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Items that match your size preferences and style
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-indigo-500" />
                  <h3 className="font-coquette font-semibold text-gray-700">Learning System</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Gets smarter with every interaction and preference update
                </p>
              </div>
            </div>

            {/* SmartMatch Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smartMatchItems.map((smartMatch) => {
                const { item, score, reasons } = smartMatch
                const isExpanded = expandedItem === item.id

                return (
                  <div key={item.id} className="card-coquette overflow-hidden group relative">
                    {/* AI Score Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {Math.round(score)}% Match
                      </div>
                    </div>

                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <WishlistButton itemId={item.id} />
                    </div>

                    {/* Item Image */}
                    <div className="relative h-48 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {item.profiles?.avatar_url ? (
                          <img 
                            src={item.profiles.avatar_url} 
                            alt="Profile" 
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 rounded-full"></div>
                        )}
                        <span className="text-sm text-coquette-pink-600">
                          {item.profiles?.full_name || item.profiles?.username || 'Unknown'}
                        </span>
                      </div>

                      <h3 className="font-coquette font-semibold text-lg text-coquette-pink-700 mb-2">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-coquette-pink-600 mb-3">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span>{item.condition}</span>
                        <span>•</span>
                        <span>{item.size}</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>

                      {/* AI Reasons */}
                      <div className="mb-4">
                        <button
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                          className="text-xs text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                        >
                          <Brain className="w-3 h-3" />
                          Why AI recommends this
                          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <ul className="space-y-1">
                              {reasons.map((reason, index) => (
                                <li key={index} className="text-xs text-purple-700 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-purple-400 rounded-full mt-2 flex-shrink-0"></span>
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/browse"
                        onClick={() => handleItemClick(item)}
                        className="w-full btn-coquette text-sm px-4 py-2 text-center block"
                      >
                        View Item
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Learn More */}
            <div className="text-center mt-12">
              <Link 
                href="/browse" 
                className="btn-coquette-outline"
              >
                Browse All Items
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
