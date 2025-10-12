'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, Heart, Share2, User } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getItemById, addToWishlist, removeFromWishlist, getWishlist } from '@/lib/database'
import { Item } from '@/lib/database'
import DirectChatModal from '@/components/chat/DirectChatModal'
import DirectMessagingModal from '@/components/chat/DirectMessagingModal'
import Link from 'next/link'

interface ItemWithProfile extends Item {
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function ItemDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [item, setItem] = useState<ItemWithProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [showDirectMessageModal, setShowDirectMessageModal] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return

      try {
        const fetchedItem = await getItemById(itemId)
        if (!fetchedItem) {
          setError('Item not found')
          return
        }
        setItem(fetchedItem)
      } catch (error) {
        console.error('Failed to fetch item:', error)
        setError('Failed to load item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId])

  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !item) return

      try {
        const wishlist = await getWishlist(user.id)
        setIsInWishlist(wishlist.some((w: { item_id: string }) => w.item_id === item.id))
      } catch (error) {
        console.error('Failed to check wishlist:', error)
      }
    }

    checkWishlist()
  }, [user, item])

  const handleWishlistToggle = async () => {
    if (!user || !item || wishlistLoading) return

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        await removeFromWishlist(user.id, item.id)
        setIsInWishlist(false)
      } else {
        await addToWishlist(user.id, item.id)
        setIsInWishlist(true)
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleSendTradeRequest = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setShowTradeModal(true)
  }

  const handleSendMessage = () => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    setShowDirectMessageModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pink-800">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-elegant font-bold text-pink-800 mb-4">
            {error || 'Item not found'}
          </h1>
          <Link
            href="/browse"
            className="btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-pink-700" />
          </button>
          <h1 className="text-2xl font-elegant font-bold text-pink-800">
            Item Details
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <span className="text-pink-600 text-lg">No Image</span>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden shadow">
                    <img
                      src={image}
                      alt={`${item.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Item Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-elegant font-bold text-pink-800 mb-2">
                    {item.name}
                  </h2>
                  <p className="text-xl text-pink-700 font-medium mb-3">
                    {item.brand}
                  </p>

                  {/* Price and Listing Type */}
                  {item.listing_type === 'for_sale' && item.price && (
                    <div className="mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-green-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                          For Sale
                        </span>
                      </div>
                      
                      {/* Payment Methods */}
                      {item.payment_methods && item.payment_methods.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-pink-700 mb-2 font-medium">Accepted Payment Methods:</p>
                          <div className="flex flex-wrap gap-2">
                            {item.payment_methods.map((method) => (
                              <span
                                key={method}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200"
                              >
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {item.listing_type === 'free' && (
                    <div className="mb-3">
                      <span className="inline-block text-xl font-bold text-primary-600 bg-primary-100 px-4 py-2 rounded-full">
                        Free
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`p-2 rounded-lg transition-colors ${
                      isInWishlist 
                        ? 'bg-pink-200 text-pink-700' 
                        : 'bg-white/50 hover:bg-white text-pink-500 hover:text-pink-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button className="p-2 bg-white/50 hover:bg-white text-pink-500 hover:text-pink-700 rounded-lg transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-pink-700 bg-pink-200 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                {item.subcategory && (
                  <span className="text-xs text-pink-600 bg-pink-200 px-3 py-1 rounded-full">
                    {item.subcategory}
                  </span>
                )}
                <span className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {item.condition}
                </span>
                {item.size && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    Size: {item.size}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-elegant font-semibold text-pink-800 mb-3">
                Description
              </h3>
              <p className="text-pink-700 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Lister Info */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-elegant font-semibold text-pink-800 mb-3">
                Listed by
              </h3>
              <div className="flex items-center gap-3">
                {item.profiles?.avatar_url ? (
                  <img
                    src={item.profiles.avatar_url}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-pink-700">
                    {item.profiles?.full_name || item.profiles?.username || 'Unknown User'}
                  </p>
                  <p className="text-sm text-pink-600">
                    @{item.profiles?.username}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user && user.id !== item.user_id && (
              <div className="space-y-3">
                <button
                  onClick={handleSendMessage}
                  className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white font-medium py-4 px-8 rounded-xl shadow-soft hover:shadow-primary transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  Send a Message
                </button>

                <button
                  onClick={handleSendTradeRequest}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  {item.listing_type === 'for_sale' ? 'Make an Offer' : 'Send Trade Request'}
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-pink-700">
                    <strong>Send a Message:</strong> Ask questions without commitment.<br/>
                    <strong>{item.listing_type === 'for_sale' ? 'Make an Offer' : 'Send Trade Request'}:</strong> Express serious interest {item.listing_type === 'for_sale' ? 'and negotiate' : 'to trade'}.
                  </p>
                </div>
              </div>
            )}

            {/* Item Stats */}
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-lg font-elegant font-semibold text-pink-800 mb-3">
                Item Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-pink-600">Listed:</span>
                  <p className="font-medium text-pink-700">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-pink-600">Status:</span>
                  <p className={`font-medium ${
                    item.status === 'available' ? 'text-green-600' :
                    item.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {item.status === 'available' ? 'Available' :
                     item.status === 'pending' ? 'Pending Trade' :
                     'Traded'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Request Modal */}
      {showTradeModal && item && (
        <DirectChatModal
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          item={item}
        />
      )}

      {/* Direct Messaging Modal */}
      {showDirectMessageModal && item && (
        <DirectMessagingModal
          isOpen={showDirectMessageModal}
          onClose={() => setShowDirectMessageModal(false)}
          recipientId={item.user_id}
          recipientUsername={item.profiles?.username || 'User'}
          item={{
            id: item.id,
            name: item.name,
            brand: item.brand,
            images: item.images,
            listing_type: item.listing_type,
            price: item.price
          }}
        />
      )}
    </div>
  )
}
