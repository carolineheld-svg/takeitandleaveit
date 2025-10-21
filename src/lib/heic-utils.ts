import { useState, useEffect } from 'react'

// Utility function to handle HEIC image display
export async function getDisplayableImageUrl(imageUrl: string): Promise<string> {
  // Check if the image URL is a HEIC file
  if (imageUrl.toLowerCase().includes('.heic') || imageUrl.toLowerCase().includes('.heif')) {
    try {
      // Fetch the HEIC image
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Convert HEIC to JPEG using heic2any
      const heic2any = (await import('heic2any')).default
      const convertedBlob = await heic2any({
        blob: blob,
        toType: 'image/jpeg',
        quality: 0.8
      }) as Blob
      
      // Create a new URL for the converted image
      return URL.createObjectURL(convertedBlob)
    } catch (error) {
      console.error('Failed to convert HEIC image:', error)
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
          setDisplayUrl(imageUrl) // Fallback to original
          setLoading(false)
          setError(true)
        })
    }
  }, [imageUrl])

  return { displayUrl, loading, error }
}
