'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Save, Shirt } from 'lucide-react'
import { smartMatchAI } from '@/lib/smartmatch'
import { SIZE_PREFERENCES } from '@/lib/constants'

interface SizePreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSave: () => void
}

export default function SizePreferencesModal({ isOpen, onClose, userId, onSave }: SizePreferencesModalProps) {
  const [sizePreferences, setSizePreferences] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadSizePreferences = useCallback(async () => {
    setLoading(true)
    try {
      const preferences = await smartMatchAI.getUserPreferences(userId)
      setSizePreferences(preferences?.size_preferences as Record<string, string[]> || {})
    } catch (error) {
      console.error('Failed to load size preferences:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isOpen) {
      loadSizePreferences()
    }
  }, [isOpen, userId, loadSizePreferences])

  const handleSizeToggle = (category: string, size: string) => {
    setSizePreferences(prev => {
      const currentSizes = prev[category] || []
      const newSizes = currentSizes.includes(size)
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size]
      
      return {
        ...prev,
        [category]: newSizes
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await smartMatchAI.updateSizePreferences(userId, sizePreferences)
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save size preferences:', error)
      alert('Failed to save size preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSelectAll = (category: string) => {
    const allSizes = SIZE_PREFERENCES[category as keyof typeof SIZE_PREFERENCES] || []
    setSizePreferences(prev => ({
      ...prev,
      [category]: allSizes
    }))
  }

  const handleClearAll = (category: string) => {
    setSizePreferences(prev => ({
      ...prev,
      [category]: []
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-2xl font-elegant font-bold text-primary-800">
                Size Preferences
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-primary-500 hover:text-primary-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-primary-600">
              Set your size preferences for clothing items only. This helps our SmartMatch AI recommend items that fit you perfectly!
            </p>
            <p className="text-sm text-primary-500 mt-2">
              Size preferences only apply to clothing categories (Clothing, Sports & Recreation clothing).
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary-600">Loading your preferences...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Clothing Categories */}
              {Object.entries(SIZE_PREFERENCES).map(([category, sizes]) => (
                <div key={category} className="border border-coquette-pink-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-coquette font-semibold text-lg text-coquette-pink-700">
                      {category}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectAll(category)}
                        className="text-xs text-coquette-pink-500 hover:text-coquette-pink-700 transition-colors"
                      >
                        Select All
                      </button>
                      <span className="text-coquette-pink-300">|</span>
                      <button
                        onClick={() => handleClearAll(category)}
                        className="text-xs text-coquette-pink-500 hover:text-coquette-pink-700 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {sizes.map(size => {
                      const isSelected = (sizePreferences[category] || []).includes(size)
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeToggle(category, size)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-coquette-pink-500 text-white'
                              : 'bg-coquette-pink-100 text-coquette-pink-700 hover:bg-coquette-pink-200'
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Non-clothing info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-coquette font-semibold text-lg text-gray-700 mb-2">
                  Non-Clothing Items
                </h3>
                <p className="text-gray-600 text-sm">
                  Size preferences only apply to clothing items. For other categories like Electronics, Books, and Dorm Items, 
                  our SmartMatch AI will recommend based on your browsing and search history.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-coquette-pink-200 text-coquette-pink-600 rounded-lg hover:bg-coquette-pink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-coquette-pink-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-coquette-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
