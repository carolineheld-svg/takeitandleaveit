'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, User, Package } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getDirectMessageConversations } from '@/lib/database'
import DirectMessagingModal from '@/components/chat/DirectMessagingModal'

interface Conversation {
  otherUserId: string
  otherUser: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  latestMessage: {
    id: string
    created_at: string
    message: string
    sender_id: string
    is_read: boolean
  }
  unreadCount: number
  item?: {
    id: string
    name: string
    brand: string
    images: string[]
    listing_type: 'free' | 'for_sale'
    price: number | null
  }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const fetchConversations = async () => {
      try {
        const convos = await getDirectMessageConversations(user.id)
        setConversations(convos)
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user, router])

  const handleOpenConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowMessageModal(true)
  }

  const handleCloseModal = () => {
    setShowMessageModal(false)
    setSelectedConversation(null)
    // Refresh conversations to update unread counts
    if (user) {
      getDirectMessageConversations(user.id).then(setConversations)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-purple-700 font-elegant text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-purple-700 font-elegant text-xl">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light-purple py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-elegant font-bold text-light-purple-800 mb-4">
            Messages
          </h1>
          <p className="text-xl text-light-purple-700">
            Chat with buyers and sellers about items
          </p>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="text-2xl font-elegant font-semibold text-light-purple-800 mb-2">
                No messages yet
              </h3>
              <p className="text-light-purple-700 mb-6">
                Browse items, chat with sellers, and start trading or buying!
              </p>
              <a href="/browse" className="btn-primary">
                Browse Items
              </a>
            </div>
          ) : (
            conversations.map((conversation, index) => (
              <button
                key={`${conversation.otherUserId}-${conversation.item?.id || 'general'}-${index}`}
                onClick={() => handleOpenConversation(conversation)}
                className="w-full card-primary p-4 hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {conversation.otherUser.avatar_url ? (
                      <img
                        src={conversation.otherUser.avatar_url}
                        alt={conversation.otherUser.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Message Preview */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-elegant font-semibold text-primary-800">
                          {conversation.otherUser.full_name || conversation.otherUser.username}
                        </h3>
                        <p className="text-sm text-primary-600">
                          @{conversation.otherUser.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary-500">
                          {new Date(conversation.latestMessage.created_at).toLocaleDateString()}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Item Info if available */}
                    {conversation.item && (
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-primary-500" />
                        <span className="text-sm text-primary-700">
                          About: {conversation.item.name}
                        </span>
                      </div>
                    )}

                    <p className={`text-sm truncate ${
                      conversation.latestMessage.sender_id !== user.id && !conversation.latestMessage.is_read
                        ? 'font-semibold text-primary-800'
                        : 'text-primary-600'
                    }`}>
                      {conversation.latestMessage.sender_id === user.id ? 'You: ' : ''}
                      {conversation.latestMessage.message}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Direct Messaging Modal */}
      {selectedConversation && (
        <DirectMessagingModal
          isOpen={showMessageModal}
          onClose={handleCloseModal}
          recipientId={selectedConversation.otherUserId}
          recipientUsername={selectedConversation.otherUser.username}
          item={selectedConversation.item}
        />
      )}
    </div>
  )
}

