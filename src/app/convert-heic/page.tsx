'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'

export default function HEICConverter() {
  const [converting, setConverting] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState('')

  const convertHEICImages = async () => {
    setConverting(true)
    setError('')
    setResults([])
    
    try {
      const supabase = createClient()
      
      // Get all items with images (same query as check-formats page)
      const { data: allItems, error: fetchError } = await supabase
        .from('items')
        .select('id, images, name')
        .not('images', 'is', null)
        .neq('images', '{}')
      
      if (fetchError) {
        throw new Error(`Failed to fetch items: ${fetchError.message}`)
      }
      
      // Filter for items that actually have HEIC images
      const items = (allItems || []).filter(item => 
        item.images.some((imageUrl: string) => 
          imageUrl.toLowerCase().includes('.heic') || 
          imageUrl.toLowerCase().includes('.heif')
        )
      )
      
      if (items.length === 0) {
        setResults(['No HEIC images found to convert'])
        setConverting(false)
        return
      }
      
      setResults([`Found ${items.length} items with HEIC images`])
      
      // Debug: Show which items have HEIC images
      items.forEach(item => {
        const heicImages = item.images.filter((imageUrl: string) => 
          imageUrl.toLowerCase().includes('.heic') || 
          imageUrl.toLowerCase().includes('.heif')
        )
        setResults(prev => [...prev, `  - ${item.name}: ${heicImages.length} HEIC images`])
      })
      
      // Convert each item's images
      for (const item of items) {
        const convertedImages: string[] = []
        
        for (let i = 0; i < item.images.length; i++) {
          const imageUrl = item.images[i]
          
          if (imageUrl.toLowerCase().includes('.heic') || imageUrl.toLowerCase().includes('.heif')) {
            try {
              setResults(prev => [...prev, `Converting ${item.name} - Image ${i + 1}...`])
              
              // Fetch the HEIC image
              const response = await fetch(imageUrl)
              if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.status}`)
              }
              
              const blob = await response.blob()
              
              // Convert HEIC to JPEG using heic2any
              const heic2any = (await import('heic2any')).default
              const convertedBlob = await heic2any({
                blob: blob,
                toType: 'image/jpeg',
                quality: 0.8
              }) as Blob
              
              // Upload the converted JPEG to Supabase Storage
              const fileName = `converted_${item.id}_${i}_${Date.now()}.jpg`
              const filePath = `converted/${fileName}`
              
              const { error: uploadError } = await supabase.storage
                .from('item-images')
                .upload(filePath, convertedBlob, {
                  cacheControl: '3600',
                  upsert: false,
                })
              
              if (uploadError) {
                throw new Error(`Failed to upload converted image: ${uploadError.message}`)
              }
              
              // Get the public URL
              const { data: publicUrlData } = supabase.storage
                .from('item-images')
                .getPublicUrl(filePath)
              
              if (publicUrlData) {
                convertedImages.push(publicUrlData.publicUrl)
                setResults(prev => [...prev, `✓ Converted ${item.name} - Image ${i + 1}`])
              }
            } catch (conversionError) {
              console.error(`Failed to convert image ${i + 1} for item ${item.name}:`, conversionError)
              setResults(prev => [...prev, `✗ Failed to convert ${item.name} - Image ${i + 1}`])
              // Keep original URL as fallback
              convertedImages.push(imageUrl)
            }
          } else {
            // Keep non-HEIC images as is
            convertedImages.push(imageUrl)
          }
        }
        
        // Update the item with converted images
        const { error: updateError } = await supabase
          .from('items')
          .update({ images: convertedImages })
          .eq('id', item.id)
        
        if (updateError) {
          throw new Error(`Failed to update item ${item.name}: ${updateError.message}`)
        }
        
        setResults(prev => [...prev, `✓ Updated ${item.name} in database`])
      }
      
      setResults(prev => [...prev, '🎉 All HEIC images converted successfully!'])
      
    } catch (err) {
      console.error('Conversion failed:', err)
      setError(err instanceof Error ? err.message : 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">HEIC Image Converter</h1>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          This tool will convert all existing HEIC images to JPEG format and update the database.
        </p>
        
        <button
          onClick={convertHEICImages}
          disabled={converting}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {converting ? 'Converting...' : 'Convert HEIC Images'}
        </button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            Error: {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Results:</h3>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index} className="text-sm py-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
