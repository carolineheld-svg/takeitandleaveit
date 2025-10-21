'use client'

import { useState, useEffect } from 'react'

interface HEICImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export default function HEICImage({ src, alt, className, onLoad, onError }: HEICImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isHEIC, setIsHEIC] = useState(false)

  useEffect(() => {
    setIsHEIC(src.toLowerCase().includes('.heic') || src.toLowerCase().includes('.heif'))
  }, [src])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Image failed to load:', src)
    setImageError(true)
    if (onError) onError(e)
  }

  // If it's a HEIC file and there's an error, show placeholder
  if (isHEIC && imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-xs text-center p-2">
          <div className="w-8 h-8 mx-auto mb-1 bg-gray-300 rounded flex items-center justify-center">
            📷
          </div>
          Image unavailable
        </div>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={handleError}
    />
  )
}
