'use client'

import { useState } from 'react'
import { X, Send, MessageCircle, MapPin } from 'lucide-react'
import { CAMPUS_LOCATIONS } from '@/lib/constants'

interface TradeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  item: {
    id: string
    name: string
    brand: string
    user_id: string
    profiles: {
      username: string
    }
  }
  onSendRequest: (message: string, meetingLocation?: string) => void
}

export default function TradeRequestModal({ 
  isOpen, 
  onClose, 
  item, 
  onSendRequest 
}: TradeRequestModalProps) {
  const [message, setMessage] = useState('')
  const [meetingLocation, setMeetingLocation] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    try {
      await onSendRequest(message.trim(), meetingLocation || undefined)
      setMessage('')
      setMeetingLocation('')
      onClose()
    } catch (error) {
      console.error('Failed to send trade request:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-coquette-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-coquette font-bold text-coquette-pink-700">
              Send Trade Request
            </h2>
            <button
              onClick={onClose}
              className="text-coquette-pink-400 hover:text-coquette-pink-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-coquette-pink-50 rounded-lg p-4 mb-6">
            <h3 className="font-coquette font-semibold text-coquette-pink-700 mb-1">
              {item.name}
            </h3>
            <p className="text-coquette-gold-600 text-sm mb-2">{item.brand}</p>
            <p className="text-coquette-pink-600 text-sm">
              Listed by @{item.profiles.username}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Message (Optional)
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 text-coquette-pink-400 w-5 h-5" />
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Tell them why you'd love to trade for this item..."
                />
              </div>
            </div>

            {/* Meeting Location */}
            <div>
              <label htmlFor="meetingLocation" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Preferred Meeting Location (Optional)
              </label>
              <select
                id="meetingLocation"
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
              >
                <option value="">Select a campus location</option>
                {CAMPUS_LOCATIONS.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-coquette-pink-200 text-coquette-pink-600 rounded-lg hover:bg-coquette-pink-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-coquette disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-coquette-pink-500">
              The user will receive a notification and can accept or decline your request
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
