'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, MessageCircle, User } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getTradeRequestsForUser, updateTradeRequest, updateItem } from '@/lib/database'
import ChatModal from '@/components/chat/ChatModal'

interface TradeRequest {
  id: string
  created_at: string
  updated_at: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  message: string | null
  meeting_location: string | null
  from_user_id: string
  to_user_id: string
  item_id: string
  items: {
    name: string
    brand: string
    images: string[]
  }
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function TradesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [selectedTradeRequest, setSelectedTradeRequest] = useState<TradeRequest | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  useEffect(() => {
    const fetchTradeRequests = async () => {
      if (!user) return
      
      try {
        const requests = await getTradeRequestsForUser(user.id)
        setTradeRequests(requests)
      } catch (error) {
        console.error('Failed to fetch trade requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTradeRequests()
  }, [user])

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-purple-700 font-elegant text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  const handleAccept = async (requestId: string) => {
    try {
      // Update trade request status
      await updateTradeRequest(requestId, { status: 'accepted' })
      
      // Mark the item as traded
      const request = tradeRequests.find(req => req.id === requestId)
      if (request) {
        await updateItem(request.item_id, {
          is_traded: true,
          traded_to_user_id: request.from_user_id
        })
      }
      
      // Update local state
      setTradeRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' as const } : req
        )
      )
      
      alert('Trade request accepted! You can now coordinate the exchange.')
    } catch (error) {
      console.error('Failed to accept trade request:', error)
      alert('Failed to accept trade request. Please try again.')
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      await updateTradeRequest(requestId, { status: 'declined' })
      
      setTradeRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'declined' as const } : req
        )
      )
      
      alert('Trade request declined.')
    } catch (error) {
      console.error('Failed to decline trade request:', error)
      alert('Failed to decline trade request. Please try again.')
    }
  }

  const handleChat = (request: TradeRequest) => {
    setSelectedTradeRequest(request)
    setShowChatModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-coquette-gold-500" />
      case 'accepted':
        return <Check className="w-5 h-5 text-green-500" />
      case 'declined':
        return <X className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-coquette-gold-100 text-coquette-gold-700'
      case 'accepted':
        return 'bg-green-100 text-green-700'
      case 'declined':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const receivedRequests = tradeRequests.filter(req => req.to_user_id === user?.id && req.status === 'pending')
  const processedRequests = tradeRequests.filter(req => req.from_user_id === user?.id || req.status !== 'pending')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-purple-700 font-elegant text-xl">Loading trade requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light-purple">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-elegant font-bold text-light-purple-800 mb-4">
            Trade Requests
          </h1>
          <p className="text-xl text-light-purple-700 max-w-2xl mx-auto">
            Manage your incoming and outgoing trade requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-coquette">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'received'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-light-purple-600 hover:text-light-purple-700'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'sent'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-light-purple-600 hover:text-light-purple-700'
              }`}
            >
              Sent ({processedRequests.length})
            </button>
          </div>
        </div>

        {/* Trade Requests */}
        <div className="space-y-6">
          {(activeTab === 'received' ? receivedRequests : processedRequests).map((request) => (
            <div key={request.id} className="card-coquette p-6">
              <div className="flex items-start gap-4">
                {/* Item Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-coquette-pink-100 to-coquette-gold-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={request.items.images[0] || '/api/placeholder/400/500'}
                    alt={request.items.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Request Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-elegant font-semibold text-light-purple-800 text-lg">
                        {request.items.name}
                      </h3>
                      <p className="text-light-purple-600 text-sm">{request.items.brand}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-light-purple-600 mb-3">
                    <User className="w-4 h-4" />
                    <span>@{request.profiles.username}</span>
                    <span>•</span>
                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>

                  {request.message && (
                    <div className="bg-coquette-pink-50 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-coquette-pink-500 mt-0.5 flex-shrink-0" />
                        <p className="text-coquette-pink-700 text-sm">{request.message}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'received' && request.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  )}

                  {request.status === 'accepted' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleChat(request)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat & Coordinate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {((activeTab === 'received' ? receivedRequests : processedRequests).length === 0) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-coquette-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-12 h-12 text-coquette-pink-400" />
            </div>
            <h3 className="text-2xl font-elegant font-semibold text-light-purple-800 mb-2">
              {activeTab === 'received' ? 'No pending requests' : 'No sent requests'}
            </h3>
            <p className="text-light-purple-700 mb-6">
              {activeTab === 'received' 
                ? 'You don\'t have any pending trade requests right now.'
                : 'You haven\'t sent any trade requests yet.'
              }
            </p>
            <a href="/browse" className="btn-coquette">
              Browse Items
            </a>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedTradeRequest && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false)
            setSelectedTradeRequest(null)
          }}
          tradeRequest={selectedTradeRequest}
        />
      )}
    </div>
  )
}
