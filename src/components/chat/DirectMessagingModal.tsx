'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Package, CheckCircle, Clock, Check } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { sendDirectMessage, getDirectMessages, markAllDirectMessagesAsRead, createTradeRequest } from '@/lib/database'
import { createClient } from '@/lib/supabase-client'

interface DirectMessagingModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientUsername: string
  item?: {
    id: string
    name: string
    brand: string
    images: string[]
    listing_type: 'free' | 'for_sale'
    price?: number | null
  }
}

interface DirectMessage {
  id: string
  created_at: string
  message: string
  sender_id: string
  recipient_id: string
  is_read: boolean
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function DirectMessagingModal({ 
  isOpen, 
  onClose, 
  recipientId, 
  recipientUsername,
  item 
}: DirectMessagingModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [existingTradeRequest, setExistingTradeRequest] = useState<{status: string} | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const fetchedMessages = await getDirectMessages(
        user.id, 
        recipientId, 
        item?.id
      )
      setMessages(fetchedMessages)
      
      // Mark messages as read
      await markAllDirectMessagesAsRead(user.id, recipientId, item?.id)
    } catch (error) {
      console.error('Failed to fetch direct messages:', error)
    } finally {
      setLoading(false)
    }
  }, [user, recipientId, item?.id])

  // Check for existing trade request (from either user)
  const checkTradeRequest = useCallback(async () => {
    if (!user || !item) return

    try {
      // Check if there's a trade request between these users for this item
      const { data } = await supabase
        .from('trade_requests')
        .select('status')
        .eq('item_id', item.id)
        .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${recipientId}),and(from_user_id.eq.${recipientId},to_user_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setExistingTradeRequest(data)
    } catch (error) {
      console.error('Failed to check trade request:', error)
    }
  }, [user, item, recipientId, supabase])

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      checkTradeRequest()
    }
  }, [isOpen, fetchMessages, checkTradeRequest])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await sendDirectMessage({
        sender_id: user.id,
        recipient_id: recipientId,
        item_id: item?.id || null,
        message: newMessage.trim(),
        is_read: false
      })
      
      setNewMessage('')
      // Refresh messages
      await fetchMessages()
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSendTradeRequest = async () => {
    if (!user || !item) return

    // Prevent sending trade request to yourself
    if (user.id === recipientId) {
      alert("You cannot send a trade request for your own item!")
      return
    }

    const confirmed = window.confirm(
      `Send a formal ${item.listing_type === 'for_sale' ? 'purchase offer' : 'trade request'} for "${item.name}"?\n\nThe seller will be notified and can accept or decline.`
    )
    
    if (!confirmed) return

    try {
      await createTradeRequest({
        from_user_id: user.id,
        to_user_id: recipientId,
        item_id: item.id,
        message: `I'm interested in ${item.listing_type === 'for_sale' ? 'purchasing' : 'trading for'} ${item.name}`,
        meeting_location: null
      })
      
      // Refresh trade request status
      const { data } = await supabase
        .from('trade_requests')
        .select('status')
        .eq('item_id', item.id)
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      
      setExistingTradeRequest(data)
      
      alert('Trade request sent! The seller will be notified and can accept or decline.')
    } catch (error) {
      console.error('Failed to send trade request:', error)
      alert('Failed to send trade request. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-2xl font-elegant font-bold text-primary-800">
              Message @{recipientUsername}
            </h2>
            <button
              onClick={onClose}
              className="text-primary-600 hover:text-primary-700 transition-colors p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {item && (
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-elegant font-semibold text-primary-800">
                    {item.name}
                  </h3>
                  <p className="text-primary-700 text-sm">{item.brand}</p>
                  {item.listing_type === 'for_sale' && item.price && (
                    <p className="text-green-600 font-bold text-sm">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                  {item.listing_type === 'free' && (
                    <p className="text-primary-600 font-semibold text-xs bg-primary-100 px-2 py-1 rounded-full inline-block">
                      Free
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trade Request Status & Action */}
          {item && existingTradeRequest && (
            <div className="mt-3">
              {existingTradeRequest.status === 'pending' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold">Trade Request Pending</span>
                  </div>
                  <p className="text-xs text-center text-yellow-700">
                    Waiting for seller to accept or decline your request.
                  </p>
                </div>
              )}
              {existingTradeRequest.status === 'accepted' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-semibold">Trade Accepted! 🎉</span>
                  </div>
                  <p className="text-xs text-center text-green-700">
                    Coordinate payment and pickup details below. Item will be marked as traded.
                  </p>
                </div>
              )}
              {existingTradeRequest.status === 'declined' && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <X className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-800 font-semibold">Request Declined</span>
                  </div>
                  <p className="text-xs text-center text-gray-600">
                    The seller declined your trade request.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Casual Chat Notice (only if no trade request) */}
          {item && !existingTradeRequest && (
            <div className="mt-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <p className="text-sm text-blue-700">
                  💬 Chat casually with the seller. No commitment yet!
                </p>
              </div>
              <button
                onClick={handleSendTradeRequest}
                className="w-full bg-gradient-to-r from-rose-400 to-lavender-400 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {item.listing_type === 'for_sale' ? 'Send Purchase Offer' : 'Send Trade Request'}
              </button>
              <p className="text-xs text-center text-primary-600 mt-2">
                Ready to {item.listing_type === 'for_sale' ? 'buy' : 'trade'}? Send a formal request that the seller can accept or decline.
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Send className="w-12 h-12 text-primary-400 mx-auto mb-4" />
              <p className="text-primary-700 mb-2">Start a conversation!</p>
              <p className="text-sm text-primary-600">
                Send a message to ask questions or express interest.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender_id === user?.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-primary-100 text-primary-800'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-white/80' : 'text-primary-600'
                    }`}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 sm:p-6 border-t border-primary-100">
          <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 sm:px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-base"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4 py-3 min-h-[48px] touch-manipulation"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

