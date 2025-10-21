'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'

interface ItemWithImages {
  id: string
  name: string
  images: string[]
}

export default function ImageFormatChecker() {
  const [items, setItems] = useState<ItemWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkImageFormats()
  }, [])

  const checkImageFormats = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('items')
        .select('id, name, images')
        .not('images', 'is', null)
        .neq('images', '{}')
      
      if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`)
      }
      
      setItems(data || [])
      setLoading(false)
    } catch (err) {
      console.error('Error checking image formats:', err)
      setError(err instanceof Error ? err.message : 'Failed to check image formats')
      setLoading(false)
    }
  }

  const getImageFormat = (imageUrl: string) => {
    const url = imageUrl.toLowerCase()
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'JPEG'
    if (url.includes('.png')) return 'PNG'
    if (url.includes('.heic')) return 'HEIC'
    if (url.includes('.heif')) return 'HEIF'
    if (url.includes('.webp')) return 'WebP'
    if (url.includes('.gif')) return 'GIF'
    return 'Unknown'
  }

  const formatCounts = items.reduce((acc, item) => {
    item.images.forEach((imageUrl: string) => {
      const format = getImageFormat(imageUrl)
      acc[format] = (acc[format] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checking Image Formats...</h1>
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Error</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Current Image Formats in Database</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Format Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(formatCounts).map(([format, count]) => (
            <div key={format} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600">{format} images</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">All Items with Images</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">{item.name}</h3>
              <div className="space-y-2">
                {item.images.map((imageUrl: string, index: number) => (
                  <div key={index} className="flex items-center space-x-4 text-sm">
                    <span className="w-20 text-gray-500">Image {index + 1}:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      getImageFormat(imageUrl) === 'HEIC' || getImageFormat(imageUrl) === 'HEIF' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getImageFormat(imageUrl)}
                    </span>
                    <span className="text-gray-600 truncate max-w-md">{imageUrl}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Summary</h3>
        <p className="text-blue-700">
          Total items with images: {items.length}
        </p>
        <p className="text-blue-700">
          Total images: {Object.values(formatCounts).reduce((a, b) => a + b, 0)}
        </p>
        {(formatCounts['HEIC'] || formatCounts['HEIF']) && (
          <p className="text-red-700 font-medium">
            ⚠️ Found {(formatCounts['HEIC'] || 0) + (formatCounts['HEIF'] || 0)} HEIC/HEIF images that need conversion
          </p>
        )}
      </div>
    </div>
  )
}
