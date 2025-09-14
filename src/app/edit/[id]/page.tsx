'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { X, Camera, Tag, FileText, Hash, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { getItemById, updateItem, deleteItem } from '@/lib/database'
import { uploadMultipleImages } from '@/lib/supabase-storage'
import { CATEGORIES, CONDITIONS, SIZES } from '@/lib/constants'

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

export default function EditItemPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [item, setItem] = useState<any>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
  }, [user, router])

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId || !user) return

      try {
        const fetchedItem = await getItemById(itemId)
        
        if (!fetchedItem) {
          setError('Item not found')
          setLoading(false)
          return
        }

        // Check if user owns this item
        if (fetchedItem.user_id !== user.id) {
          setError('You can only edit your own items')
          setLoading(false)
          return
        }

        setItem(fetchedItem)
        setFormData({
          name: fetchedItem.name,
          brand: fetchedItem.brand,
          category: fetchedItem.category,
          subcategory: fetchedItem.subcategory || '',
          condition: fetchedItem.condition,
          size: fetchedItem.size,
          description: fetchedItem.description,
          images: [] // We'll keep existing images, only add new ones
        })
      } catch (error) {
        console.error('Failed to fetch item:', error)
        setError('Failed to load item')
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [itemId, user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
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
    setSaving(true)
    setError('')

    if (!formData.name || !formData.brand || !formData.category || !formData.condition || !formData.size) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    if (!user) {
      setError('You must be logged in to edit an item')
      setSaving(false)
      return
    }

    try {
      let imageUrls = item?.images || []

      // Upload new images if any
      if (formData.images.length > 0) {
        const newImageUrls = await uploadMultipleImages(formData.images, user.id, itemId)
        imageUrls = [...imageUrls, ...newImageUrls]
      }

      // Update the item
      await updateItem(itemId, {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        subcategory: formData.subcategory || null,
        condition: formData.condition,
        size: formData.size,
        description: formData.description,
        images: imageUrls
      })

      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await deleteItem(itemId)
      router.push('/profile')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to delete item')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-coquette-pink-200 border-t-coquette-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-coquette-pink-600 font-coquette text-xl">Loading item...</p>
        </div>
      </div>
    )
  }

  if (error && !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card-coquette p-8">
            <h2 className="text-2xl font-coquette font-bold text-coquette-pink-700 mb-4">
              Error
            </h2>
            <p className="text-coquette-pink-600 mb-6">{error}</p>
            <Link href="/profile" className="btn-coquette">
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    )
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
              Item Updated!
            </h2>
            <p className="text-coquette-pink-600 mb-6">
              Your item has been successfully updated.
            </p>
            <div className="space-y-3">
              <Link href="/profile" className="btn-coquette w-full">
                View My Items
              </Link>
              <Link href="/browse" className="btn-coquette-outline w-full">
                Browse Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coquette-pink-50 to-coquette-gold-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/profile" 
            className="flex items-center gap-2 text-coquette-pink-600 hover:text-coquette-pink-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-coquette font-bold text-coquette-pink-700 mb-4">
            Edit Item
          </h1>
          <p className="text-xl text-coquette-pink-600">
            Update your item details
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
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
                      {SIZES.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
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
                      placeholder="Describe your item in detail..."
                    />
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label htmlFor="images" className="block text-sm font-medium text-coquette-pink-700 mb-2">
                    Add More Images
                  </label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coquette-pink-400 w-5 h-5" />
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full pl-10 pr-4 py-3 border border-coquette-pink-200 rounded-lg focus:ring-2 focus:ring-coquette-pink-400 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-coquette-pink-100 file:text-coquette-pink-700 hover:file:bg-coquette-pink-200"
                    />
                  </div>
                  <p className="text-sm text-coquette-pink-500 mt-2">
                    You can add up to 4 additional images. Existing images will be kept.
                  </p>
                </div>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-coquette-pink-700 mb-2">
                      New Images to Add
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-coquette disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Updating...' : 'Update Item'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-coquette p-6 sticky top-8">
              <h3 className="text-xl font-coquette font-semibold text-coquette-pink-700 mb-4">
                Editing Tips
              </h3>
              <ul className="space-y-3 text-sm text-coquette-pink-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-coquette-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                  Be specific about the item's condition and any wear
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-coquette-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                  Include the brand and size for better searchability
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-coquette-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                  Add more photos to show different angles
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-coquette-pink-400 rounded-full mt-2 flex-shrink-0"></span>
                  Keep your description honest and detailed
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
