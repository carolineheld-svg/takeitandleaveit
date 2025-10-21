'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function DetailedImageDebug() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    debugImages()
  }, [])

  const debugImages = async () => {
    try {
      console.log('Starting debug images...')
      const supabase = createClient()
      console.log('Supabase client created')
      
      const { data, error } = await supabase
        .from('items')
        .select('id, name, images')
        .not('images', 'is', null)
        .neq('images', '{}')
      
      console.log('Query result:', { data, error })
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to fetch items: ${error.message}`)
      }
      
      console.log('Setting items:', data)
      setItems(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error in debugImages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
      setLoading(false)
    }
  }

  const analyzeImageUrl = (url: string) => {
    const lowerUrl = url.toLowerCase()
    return {
      url,
      hasHeic: lowerUrl.includes('.heic'),
      hasHeif: lowerUrl.includes('.heif'),
      hasJpg: lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg'),
      hasPng: lowerUrl.includes('.png'),
      hasWebp: lowerUrl.includes('.webp'),
      hasGif: lowerUrl.includes('.gif'),
      extension: url.split('.').pop()?.toLowerCase() || 'none',
      filename: url.split('/').pop() || 'unknown'
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Images - Loading...</h1>
        <div className="animate-pulse">Loading...</div>
        <div className="mt-4 text-sm text-gray-600">
          Check browser console for debug logs
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Images - Error</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 mb-4">
          Error: {error}
        </div>
        <button 
          onClick={debugImages}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Detailed Image URL Analysis</h1>
      
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">{item.name}</h2>
            
            <div className="space-y-3">
              {item.images.map((imageUrl: string, index: number) => {
                const analysis = analyzeImageUrl(imageUrl)
                const isHeic = analysis.hasHeic || analysis.hasHeif
                
                return (
                  <div key={index} className={`p-3 rounded border-l-4 ${
                    isHeic ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="font-medium">Image {index + 1}:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isHeic ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                      }`}>
                        {isHeic ? 'HEIC/HEIF' : analysis.extension.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div><strong>Filename:</strong> {analysis.filename}</div>
                      <div><strong>Extension:</strong> {analysis.extension}</div>
                      <div><strong>Full URL:</strong> 
                        <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                          {imageUrl}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          analysis.hasHeic ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          HEIC: {analysis.hasHeic ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          analysis.hasHeif ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          HEIF: {analysis.hasHeif ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          analysis.hasJpg ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          JPG: {analysis.hasJpg ? 'YES' : 'NO'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          analysis.hasPng ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          PNG: {analysis.hasPng ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
        <p className="text-blue-700">
          Total items: {items.length}
        </p>
        <p className="text-blue-700">
          Total images: {items.reduce((acc, item) => acc + item.images.length, 0)}
        </p>
        <p className="text-blue-700">
          HEIC/HEIF images: {items.reduce((acc, item) => 
            acc + item.images.filter((url: string) => 
              url.toLowerCase().includes('.heic') || url.toLowerCase().includes('.heif')
            ).length, 0
          )}
        </p>
      </div>
    </div>
  )
}
