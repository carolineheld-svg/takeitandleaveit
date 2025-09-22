'use client'

import { useState } from 'react'
import { X, Send, MessageCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createTradeRequest } from '@/lib/database'

interface DirectChatModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    brand: string
    images: string[]
    profiles: {
      id: string
      username: string
      full_name: string | null
      avatar_url: string | null
    }
  }
}

export default function DirectChatModal({ isOpen, onClose, item }: DirectChatModalProps) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !message.trim() || sending) return

    setSending(true)
    try {
      await createTradeRequest({
        from_user_id: user.id,
        to_user_id: item.profiles.id,
        item_id: item.id,
        message: message.trim(),
        meeting_location: meetingLocation || null
      })
      
      setMessage('')
      setMeetingLocation('')
      onClose()
      alert('Trade request sent successfully! The lister will be notified and can respond.')
    } catch (error) {
      console.error('Failed to send trade request:', error)
      alert('Failed to send trade request. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-coquette-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-coquette font-semibold text-coquette-pink-700">
                Send Trade Request
              </h2>
              <p className="text-sm text-coquette-pink-500">
                Contact @{item.profiles.username}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-coquette-pink-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-coquette-pink-400" />
          </button>
        </div>

        {/* Item Preview */}
        <div className="p-6 border-b border-coquette-pink-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-coquette-pink-100 to-coquette-gold-100 rounded-lg overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-coquette-pink-400 text-xs">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-coquette font-semibold text-coquette-pink-700">
                {item.name}
              </h3>
              <p className="text-coquette-gold-600 text-sm">{item.brand}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-coquette-pink-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors resize-none"
              placeholder="Tell them why you'd love to trade for this item..."
              required
            />
          </div>

          <div>
            <label htmlFor="meetingLocation" className="block text-sm font-medium text-coquette-pink-700 mb-2">
              Preferred Meeting Location (Optional)
            </label>
            <select
              id="meetingLocation"
              value={meetingLocation}
              onChange={(e) => setMeetingLocation(e.target.value)}
              className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
            >
              <option value="">Select a campus location</option>
              <option value="Bothin Stairs">Bothin Stairs</option>
              <option value="Keck Lab">Keck Lab</option>
              <option value="Lower Booth">Lower Booth</option>
              <option value="Upper Booth">Upper Booth</option>
              <option value="Day Student Lounge">Day Student Lounge</option>
              <option value="Old Gym">Old Gym</option>
              <option value="New Gym">New Gym</option>
              <option value="Pars">Pars</option>
              <option value="High House">High House</option>
              <option value="Schoolhouse">Schoolhouse</option>
              <option value="Kirby Quad">Kirby Quad</option>
              <option value="CHE">CHE</option>
              <option value="CHW">CHW</option>
              <option value="Bothin">Bothin</option>
              <option value="CoLab">CoLab</option>
              <option value="McBean">McBean</option>
              <option value="Johnson Library">Johnson Library</option>
              <option value="Theater">Theater</option>
              <option value="Senior Lawn">Senior Lawn</option>
              <option value="Pizza Lawn">Pizza Lawn</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-coquette-pink-200 text-coquette-pink-600 rounded-lg hover:bg-coquette-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
