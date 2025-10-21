'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, Tag, FileText, Hash } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { uploadMultipleImages } from '@/lib/supabase-storage'
import { createItem } from '@/lib/database'
import { CATEGORIES, CONDITIONS, SIZES, CLOTHING_CATEGORIES, SIZE_PREFERENCES, LISTING_TYPES, PAYMENT_METHODS } from '@/lib/constants'

interface FormData {
  name: string
  brand: string
  category: string
  subcategory: string
  condition: string
  size: string
  description: string
  images: File[]
  listing_type: 'free' | 'for_sale'
  price: string
  payment_methods: string[]
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
    images: [],
    listing_type: 'free',
    price: '',
    payment_methods: []
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-purple-700 font-elegant text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || [])
      
      if (files.length === 0) {
        return
      }
      
      // Validate files
      const validFiles = files.filter(file => {
        // Check file type - NO HEIC support (too complicated)
        const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        const fileType = file.type.toLowerCase()
        const fileName = file.name.toLowerCase()
        
        // Check MIME type
        if (!supportedTypes.includes(fileType)) {
          console.warn(`Invalid MIME type: ${file.type}`)
          return false
        }
        
        // Check file extension as backup
        const extension = fileName.split('.').pop()
        const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif']
        if (!extension || !supportedExtensions.includes(extension)) {
          console.warn(`Invalid file extension: ${extension}`)
          return false
        }
        
        // Reject HEIC files specifically (by name and type)
        if (fileType.includes('heic') || fileType.includes('heif') || 
            fileName.includes('.heic') || fileName.includes('.heif')) {
          console.warn(`HEIC files not supported: ${file.name}`)
          return false
        }
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File too large: ${file.name} (${file.size} bytes)`)
          return false
        }
        
        return true
      })
      
      const remainingSlots = 4 - formData.images.length
      const filesToAdd = validFiles.slice(0, remainingSlots)
      
      if (validFiles.length !== files.length) {
        const skippedCount = files.length - validFiles.length
        const skippedFiles = files.filter(file => !validFiles.includes(file))
        const fileNames = skippedFiles.map(f => f.name).join(', ')
        
        alert(`${skippedCount} file(s) were skipped: ${fileNames}\n\nOnly JPEG, PNG, WebP, and GIF files under 10MB are supported.\n\nPlease convert your images to a supported format and try again.`)
      }
      
      if (filesToAdd.length === 0) {
        return
      }
      
      console.log('Adding files:', filesToAdd.map(f => ({ name: f.name, size: f.size, type: f.type })))
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...filesToAdd]
      }))
      
      // Clear the input so the same file can be selected again
      e.target.value = ''
    } catch (error) {
      console.error('Error handling image upload:', error)
      alert('There was an error processing your images. Please try again with supported formats (JPEG, PNG, WebP, GIF).')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      payment_methods: prev.payment_methods.includes(method)
        ? prev.payment_methods.filter(m => m !== method)
        : [...prev.payment_methods, method]
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

    // Validate for_sale specific fields
    if (formData.listing_type === 'for_sale') {
      const price = parseFloat(formData.price)
      if (!formData.price || price <= 0) {
        setError('Please enter a valid price for items for sale')
        setLoading(false)
        return
      }
      if (price > 200) {
        setError('Price cannot exceed $200.00')
        setLoading(false)
        return
      }
      // Validate 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(formData.price)) {
        setError('Price must be a valid amount with up to 2 decimal places')
        setLoading(false)
        return
      }
      if (formData.payment_methods.length === 0) {
        setError('Please select at least one payment method for items for sale')
        setLoading(false)
        return
      }
    }

    if (!user) {
      setError('You must be logged in to list an item')
      setLoading(false)
      return
    }

    try {
      // Generate a unique temporary ID for image uploads
      const tempItemId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`
      
      console.log('Starting image upload for', formData.images.length, 'images')
      console.log('User ID:', user.id, 'Temp Item ID:', tempItemId)
      
      // Upload images first
      const imageUrls = await uploadMultipleImages(formData.images, user.id, tempItemId)
      
      console.log('Image upload successful. URLs:', imageUrls)
      
      if (imageUrls.length === 0) {
        setError('Failed to upload images. Please try again.')
        setLoading(false)
        return
      }

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
        images: imageUrls,
        listing_type: formData.listing_type,
        price: formData.listing_type === 'for_sale' ? parseFloat(formData.price) : null,
        payment_methods: formData.listing_type === 'for_sale' ? formData.payment_methods : []
      })

      setSuccess(true)
    } catch (error: unknown) {
      console.error('Error during item listing:', error)
      if (error instanceof Error) {
        if (error.message.includes('upload')) {
          setError('Failed to upload images. Please check your internet connection and try again.')
        } else if (error.message.includes('storage')) {
          setError('Storage error. Please try again or contact support.')
        } else {
          setError(error.message)
        }
      } else {
        setError('Failed to list item. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-purple">
        <div className="max-w-md mx-auto text-center">
          <div className="card-primary p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h2 className="text-3xl font-elegant font-bold text-light-purple-800 mb-4">
              Item Listed!
            </h2>
            <p className="text-light-purple-700 mb-6">
              Your item is now live! Other users can browse, message you, and {formData.listing_type === 'for_sale' ? 'make purchase offers' : 'send trade requests'}.
            </p>
            <div className="space-y-4">
              <Link href="/browse" className="btn-primary w-full block">
                Browse Other Items
              </Link>
              <Link href="/list" className="btn-outline w-full block">
                List Another Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light-purple py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-elegant font-bold text-light-purple-800 mb-4">
            List Your Item
          </h1>
          <p className="text-xl text-light-purple-700">
            Give items away for free or sell them for cash - your choice!
          </p>
        </div>

        <div className="card-primary p-4 sm:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-800 mb-2">
                Item Name *
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  placeholder="e.g., Vintage Pink Blouse"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-primary-800 mb-2">
                Brand *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  required
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  placeholder="e.g., Zara, H&M, Forever 21"
                />
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-primary-800 mb-2">
                Listing Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(LISTING_TYPES).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.listing_type === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-primary-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="listing_type"
                      value={key}
                      checked={formData.listing_type === key}
                      onChange={(e) => setFormData(prev => ({ ...prev, listing_type: e.target.value as 'free' | 'for_sale' }))}
                      className="mr-2"
                    />
                    <span className="font-medium text-primary-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price - Only show for for_sale items */}
            {formData.listing_type === 'for_sale' && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-primary-800 mb-2">
                  Price * (Max $200.00)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 font-medium">$</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="200"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-primary-600 mt-1">Enter a price between $0.01 and $200.00</p>
              </div>
            )}

            {/* Payment Methods - Only show for for_sale items */}
            {formData.listing_type === 'for_sale' && (
              <div>
                <label className="block text-sm font-medium text-primary-800 mb-2">
                  Accepted Payment Methods * (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method}
                      className={`flex items-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.payment_methods.includes(method)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-primary-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.payment_methods.includes(method)}
                        onChange={() => handlePaymentMethodToggle(method)}
                        className="mr-2"
                      />
                      <span className="text-primary-800">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-primary-800 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
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
                <label htmlFor="subcategory" className="block text-sm font-medium text-primary-800 mb-2">
                  Subcategory
                </label>
                <select
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
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
                <label htmlFor="condition" className="block text-sm font-medium text-primary-800 mb-2">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
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
                  <label htmlFor="size" className="block text-sm font-medium text-primary-800 mb-2">
                    Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
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
              <label htmlFor="description" className="block text-sm font-medium text-primary-800 mb-2">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-primary-500 w-5 h-5" />
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors resize-none"
                  placeholder="Describe your item... What makes it special? Any unique details?"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-primary-800 mb-2">
                Photos (up to 4) *
              </label>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => {
                    console.log(`Image ${index}:`, { 
                      name: image.name, 
                      size: image.size, 
                      type: image.type,
                      lastModified: image.lastModified 
                    })
                    
                    const imageUrl = URL.createObjectURL(image)
                    console.log(`Generated URL for image ${index}:`, imageUrl)
                    
                    return (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onLoad={() => console.log(`Image ${index} loaded successfully`)}
                            onError={(e) => console.error(`Image ${index} failed to load:`, e)}
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
                    )
                  })}
                </div>
              )}

              {formData.images.length < 4 && (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 text-primary-500 mb-2" />
                    <p className="text-sm text-primary-700">
                      <span className="font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-primary-600">
                      Supported formats: JPEG, PNG, WebP, GIF
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      Max size: 10MB per image
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
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
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Listing Item...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/browse" className="text-light-purple-600 hover:text-light-purple-700 transition-colors">
            ← Back to Browse
          </Link>
        </div>
      </div>
    </div>
  )
}
