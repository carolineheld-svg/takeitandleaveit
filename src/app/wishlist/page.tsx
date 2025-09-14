'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, ArrowLeft, Package } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/supabase'

type WishlistItem = Database['public']['Tables']['wishlist']['Row'] & {
  items: Database['public']['Tables']['items']['Row'] & {
    profiles: Database['public']['Tables']['profiles']['Row']
  }
}

export default function WishlistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchWishlist = async () => {
      try {
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setWishlistItems(data || [])
      } catch (error) {
        console.error('Failed to fetch wishlist:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [user, router, supabase])

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user!.id)
        .eq('item_id', itemId)

      if (error) throw error

      setWishlistItems(prev => prev.filter(item => item.item_id !== itemId))
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
      alert('Failed to remove item from wishlist. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coquette-pink-600 font-coquette text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coquette-pink-50 to-coquette-gold-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/browse" 
            className="inline-flex items-center gap-2 text-coquette-pink-600 hover:text-coquette-pink-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
          
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <h1 className="text-4xl md:text-5xl font-coquette font-bold text-coquette-pink-700">
              My Wishlist
            </h1>
          </div>
          <p className="text-xl text-coquette-pink-600 mt-2">
            Items you've saved for later
          </p>
        </div>

        {/* Wishlist Items */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-coquette-pink-600 font-coquette text-xl">Loading your wishlist...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-coquette font-semibold text-gray-600 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Start browsing items and add them to your wishlist!
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
            {wishlistItems.map((wishlistItem) => {
              const item = wishlistItem.items
              if (!item) return null

              return (
                <div key={wishlistItem.id} className="card-coquette overflow-hidden">
                  {/* Item Images */}
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
                    
                    {/* Remove from wishlist button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </button>
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
                        Added {new Date(wishlistItem.created_at).toLocaleDateString()}
                      </span>
                      
                      <Link
                        href={`/browse#item-${item.id}`}
                        className="btn-coquette text-sm px-4 py-2"
                      >
                        View Item
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
