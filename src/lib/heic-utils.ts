import { useState, useEffect } from 'react'

// Utility function to handle HEIC image display
export async function getDisplayableImageUrl(imageUrl: string): Promise<string> {
  // Check if the image URL is a HEIC file
  if (imageUrl.toLowerCase().includes('.heic') || imageUrl.toLowerCase().includes('.heif')) {
    try {
      console.log('Attempting to convert HEIC image:', imageUrl)
      
      // Fetch the HEIC image
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      
      const blob = await response.blob()
      console.log('Fetched blob:', { size: blob.size, type: blob.type })
      
      // Check if the blob is actually a HEIC file
      if (!blob.type.includes('heic') && !blob.type.includes('heif')) {
        console.log('Blob is not HEIC type, returning original URL')
        return imageUrl
      }
      
      // Convert HEIC to JPEG using heic2any
      const heic2any = (await import('heic2any')).default
      const convertedBlob = await heic2any({
        blob: blob,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob
      
      console.log('HEIC conversion successful')
      // Create a new URL for the converted image
      return URL.createObjectURL(convertedBlob)
    } catch (error) {
      console.error('Failed to convert HEIC image:', error)
      console.log('Falling back to original URL')
      // Return original URL as fallback
      return imageUrl
    }
  }
  
  // Return original URL for non-HEIC images
  return imageUrl
}

// Hook to manage HEIC image conversion
export function useHEICImage(imageUrl: string) {
  const [displayUrl, setDisplayUrl] = useState<string>(imageUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Only attempt conversion for actual HEIC files
    if (imageUrl.toLowerCase().includes('.heic') || imageUrl.toLowerCase().includes('.heif')) {
      setLoading(true)
      setError(false)
      
      getDisplayableImageUrl(imageUrl)
        .then(url => {
          setDisplayUrl(url)
          setLoading(false)
        })
        .catch(err => {
          console.error('HEIC conversion failed:', err)
          // Don't set error to true, just use original URL
          setDisplayUrl(imageUrl)
          setLoading(false)
        })
    }
  }, [imageUrl])

  return { displayUrl, loading, error }
}
