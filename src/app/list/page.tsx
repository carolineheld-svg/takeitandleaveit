'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, Tag, FileText, Hash } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { uploadMultipleImages } from '@/lib/supabase-storage'
import { createItem } from '@/lib/database'
import { CATEGORIES, CONDITIONS, SIZES, CLOTHING_CATEGORIES, SIZE_PREFERENCES } from '@/lib/constants'

interface FormData {
  name: string
  brand: string
  category: string
  subcategory: string
  condition: string
  size: string
  description: string
  images: File[]
}

export default function ListItemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    condition: '',
    size: '',
    description: '',
    images: []
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coquette-pink-600 font-coquette text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = 4 - formData.images.length
    const filesToAdd = files.slice(0, remainingSlots)
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form
    const isClothingItem = CLOTHING_CATEGORIES.includes(formData.category)
    
    if (!formData.name || !formData.brand || !formData.condition || !formData.description || (isClothingItem && !formData.size)) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image')
      setLoading(false)
      return
    }

    if (!user) {
      setError('You must be logged in to list an item')
      setLoading(false)
      return
    }

    try {
      // Generate a unique temporary ID for image uploads
      const tempItemId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      // Upload images first
      const imageUrls = await uploadMultipleImages(formData.images, user.id, tempItemId)

      // Create the item in the database with image URLs
      await createItem({
        user_id: user.id,
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory,
        condition: formData.condition,
        size: formData.size,
        description: formData.description,
        images: imageUrls
      })

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to list item')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coquette-pink-50 to-coquette-gold-50">
        <div className="max-w-md mx-auto text-center">
          <div className="card-coquette p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-coquette font-bold text-coquette-pink-700 mb-4">
              Item Listed!
            </h2>
            <p className="text-coquette-pink-600 mb-6">
              Your item is now live and ready for trading. 
              Other users can now see it in the browse section.
            </p>
            <div className="space-y-3">
              <Link href="/browse" className="btn-coquette w-full">
                Browse Other Items
              </Link>
              <Link href="/list" className="btn-coquette-outline w-full">
                List Another Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coquette-pink-50 to-coquette-gold-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-coquette font-bold text-coquette-pink-700 mb-4">
            List Your Item
          </h1>
          <p className="text-xl text-coquette-pink-600">
            Give your items a second life with fellow Cate students and faculty
          </p>
        </div>

        <div className="card-coquette p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Item Name *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coquette-pink-400 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                  placeholder="e.g., Vintage Pink Blouse"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Brand *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coquette-pink-400 w-5 h-5" />
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                  placeholder="e.g., Zara, H&M, Forever 21"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
              >
                <option value="">Select category</option>
                {Object.keys(CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Subcategory */}
            {formData.category && (
              <div>
                <label htmlFor="subcategory" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                >
                  <option value="">Select subcategory (optional)</option>
                  {CATEGORIES[formData.category as keyof typeof CATEGORIES]?.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Condition and Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              {/* Size - Only show for clothing items */}
              {CLOTHING_CATEGORIES.includes(formData.category) && (
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                    Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors"
                  >
                    <option value="">Select size</option>
                    {formData.subcategory && SIZE_PREFERENCES[formData.subcategory as keyof typeof SIZE_PREFERENCES] ? (
                      SIZE_PREFERENCES[formData.subcategory as keyof typeof SIZE_PREFERENCES].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))
                    ) : (
                      SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-coquette-pink-400 w-5 h-5" />
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your item... What makes it special? Any unique details?"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-coquette-pink-700 mb-2">
                Photos (up to 4) *
              </label>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gradient-to-br from-coquette-pink-100 to-coquette-gold-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length < 4 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-coquette-pink-300 rounded-lg cursor-pointer hover:bg-coquette-pink-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-coquette-pink-400 mb-2" />
                    <p className="text-sm text-coquette-pink-600">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-coquette-pink-500">
                      PNG, JPG up to 10MB each
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-coquette disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Listing Item...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/browse" className="text-coquette-pink-600 hover:text-coquette-pink-700 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    </div>
  )
}
