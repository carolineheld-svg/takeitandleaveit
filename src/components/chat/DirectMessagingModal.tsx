'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Package } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { sendDirectMessage, getDirectMessages, markAllDirectMessagesAsRead } from '@/lib/database'

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen, fetchMessages])

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-elegant font-bold text-primary-800">
              Message @{recipientUsername}
            </h2>
            <button
              onClick={onClose}
              className="text-primary-600 hover:text-primary-700 transition-colors"
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

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💬 This is a casual conversation. You&apos;re not committed to any trade or purchase.
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
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
        <div className="p-6 border-t border-primary-100">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4 py-3"
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

