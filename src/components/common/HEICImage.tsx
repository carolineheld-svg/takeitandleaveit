'use client'

import { useHEICImage } from '@/lib/heic-utils'

interface HEICImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

export default function HEICImage({ src, alt, className, onLoad, onError }: HEICImageProps) {
  const { displayUrl, loading, error } = useHEICImage(src)

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">Converting...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">Image unavailable</div>
      </div>
    )
  }

  return (
    <img
      src={displayUrl}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
    />
  )
}
