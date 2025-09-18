'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, MapPin, Clock } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getChatMessages, createChatMessage } from '@/lib/database'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  tradeRequest: {
    id: string
    items: {
      name: string
      brand: string
      images: string[]
    }
    profiles: {
      username: string
    }
    status: string
  }
}

interface ChatMessage {
  id: string
  created_at: string
  message: string
  sender_id: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function ChatModal({ isOpen, onClose, tradeRequest }: ChatModalProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedMessages = await getChatMessages(tradeRequest.id)
      setMessages(fetchedMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }, [tradeRequest.id])

  useEffect(() => {
    if (isOpen && tradeRequest.id) {
      fetchMessages()
    }
  }, [isOpen, tradeRequest.id, fetchMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      await createChatMessage({
        trade_request_id: tradeRequest.id,
        sender_id: user.id,
        message: newMessage.trim()
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
      <div className="bg-white rounded-2xl shadow-coquette-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-coquette-pink-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-coquette font-bold text-coquette-pink-700">
              Trade Coordination
            </h2>
            <button
              onClick={onClose}
              className="text-coquette-pink-400 hover:text-coquette-pink-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-coquette-pink-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-coquette-pink-100 to-coquette-gold-100 rounded-lg overflow-hidden">
                <img
                  src={tradeRequest.items.images[0] || '/api/placeholder/100/100'}
                  alt={tradeRequest.items.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-coquette font-semibold text-coquette-pink-700">
                  {tradeRequest.items.name}
                </h3>
                <p className="text-coquette-gold-600 text-sm">{tradeRequest.items.brand}</p>
                <p className="text-coquette-pink-600 text-sm">
                  Trading with @{tradeRequest.profiles.username}
                </p>
              </div>
            </div>
          </div>

          {tradeRequest.status === 'accepted' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Trade accepted! Coordinate your meeting below.</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-coquette-pink-300 mx-auto mb-4" />
              <p className="text-coquette-pink-600 mb-2">Start coordinating your trade!</p>
              <p className="text-sm text-coquette-pink-500">
                Discuss meeting location, time, and any other details.
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
                      ? 'bg-coquette-pink-500 text-white'
                      : 'bg-coquette-pink-100 text-coquette-pink-700'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-pink-100' : 'text-coquette-pink-500'
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
        {tradeRequest.status === 'accepted' && (
          <div className="p-6 border-t border-coquette-pink-100">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-coquette disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center px-4 py-3"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
