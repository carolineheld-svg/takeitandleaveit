'use client'

import React from 'react'
import { X, Trash2, AlertTriangle } from 'lucide-react'

interface DeleteItemModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  loading?: boolean
}

export default function DeleteItemModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName,
  loading = false 
}: DeleteItemModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-elegant font-bold text-primary-800">
                Delete Item
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-primary-600 mb-4">
              Are you sure you want to delete <strong>&ldquo;{itemName}&rdquo;</strong>? This action cannot be undone.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">This will permanently:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Remove the item from the platform</li>
                    <li>• Delete all associated images</li>
                    <li>• Cancel any pending trade requests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Item
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
