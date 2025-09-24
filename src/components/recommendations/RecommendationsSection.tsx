'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Package } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getRecommendedItems } from '@/lib/database'
import WishlistButton from '@/components/wishlist/WishlistButton'
import { Database } from '@/lib/supabase'

type Item = Database['public']['Tables']['items']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export default function RecommendationsSection() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchRecommendations = async () => {
      try {
        const items = await getRecommendedItems(user.id, 6)
        setRecommendations(items)
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user])

  if (!user) return null

  return (
    <section className="py-24 bg-gradient-to-br from-rose-50 to-lavender-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-8 h-8 text-rose-500" />
            <h2 className="text-4xl font-elegant font-bold text-primary-800">
              Recommended for You
            </h2>
          </div>
          <p className="text-lg text-primary-700 max-w-2xl mx-auto">
            Items we think you&apos;ll love based on your preferences
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-primary-700 font-elegant text-xl">Finding recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-elegant font-semibold text-primary-700 mb-2">
              No recommendations yet
            </h3>
            <p className="text-primary-600 mb-6">
              Start browsing and adding items to your wishlist to get personalized recommendations!
            </p>
            <Link 
              href="/browse" 
              className="btn-coquette"
            >
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <div key={item.id} className="card-coquette overflow-hidden group">
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
                  
                  {/* Wishlist button */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <WishlistButton itemId={item.id} />
                  </div>
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

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {item.category}
                    </span>
                    
                    <Link
                      href="/browse"
                      className="btn-coquette text-sm px-4 py-2"
                    >
                      View Item
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/browse" 
              className="btn-coquette-outline"
            >
              Browse All Items
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
