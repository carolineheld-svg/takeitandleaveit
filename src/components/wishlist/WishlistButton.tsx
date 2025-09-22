'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase-client'

interface WishlistButtonProps {
  itemId: string
  className?: string
}

export default function WishlistButton({ itemId, className = '' }: WishlistButtonProps) {
  const { user } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const checkWishlistStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking wishlist status:', error)
          return
        }

        setIsInWishlist(!!data)
      } catch (error) {
        console.error('Failed to check wishlist status:', error)
      }
    }

    checkWishlistStatus()
  }, [user, itemId, supabase])

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Please sign in to add items to your wishlist')
      return
    }

    setLoading(true)
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)

        if (error) throw error
        setIsInWishlist(false)
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            item_id: itemId
          })

        if (error) throw error
        setIsInWishlist(true)
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <button
      onClick={(e) => toggleWishlist(e)}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        isInWishlist
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${className}`}
      aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${
          isInWishlist ? 'fill-current' : ''
        } ${loading ? 'animate-pulse' : ''}`} 
      />
    </button>
  )
}
