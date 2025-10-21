'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Tag, Filter, X, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { getItems } from '@/lib/database'
import DirectMessagingModal from '@/components/chat/DirectMessagingModal'
import WishlistButton from '@/components/wishlist/WishlistButton'
import HEICImage from '@/components/common/HEICImage'
import SmartMatchSection from '@/components/browse/SmartMatchSection'
import { smartMatchAI } from '@/lib/smartmatch'
import { CATEGORIES, ITEM_STATUS, LISTING_TYPES } from '@/lib/constants'

interface Item {
  id: string
  name: string
  brand: string
  category: string
  subcategory: string | null
  condition: string
  size: string | null
  description: string
  images: string[]
  status: string
  is_traded: boolean
  created_at: string
  user_id: string
  listing_type: 'free' | 'for_sale'
  price: number | null
  payment_methods: string[]
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
}

export default function BrowsePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedListingType, setSelectedListingType] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const fetchedItems = await getItems()
        setItems(fetchedItems)
        
        // Track browsing activity for SmartMatch AI
        if (user) {
          await smartMatchAI.trackUserActivity(user.id, {
            type: 'browse',
            category: selectedCategory || 'all',
            subcategory: selectedSubcategory || 'all'
          })
        }
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [user, selectedCategory, selectedSubcategory])

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    const matchesSubcategory = !selectedSubcategory || item.subcategory === selectedSubcategory
    const matchesBrand = !selectedBrand || item.brand === selectedBrand
    const matchesCondition = !selectedCondition || item.condition === selectedCondition
    const matchesSize = !selectedSize || (item.size && item.size === selectedSize)
    const matchesStatus = !selectedStatus || item.status === selectedStatus
    const matchesListingType = !selectedListingType || item.listing_type === selectedListingType
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesBrand && matchesCondition && matchesSize && matchesStatus && matchesListingType
  })

  const brands = Array.from(new Set(items.map(item => item.brand))).sort()
  const conditions = Array.from(new Set(items.map(item => item.condition))).sort()
  const categories = Array.from(new Set(items.map(item => item.category))).sort()
  const sizes = Array.from(new Set(items.map(item => item.size).filter(Boolean))).sort()

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedSubcategory('')
    setSelectedBrand('')
    setSelectedCondition('')
    setSelectedSize('')
    setSelectedStatus('')
    setSelectedListingType('')
  }

  const handleChatRequest = (item: Item) => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    if (item.user_id === user.id) {
      alert('You cannot send a trade request for your own item!')
      return
    }
    
    setSelectedItem(item)
    setShowChatModal(true)
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-green">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-green-700 font-elegant text-xl">Loading items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-elegant font-bold text-light-green-800 mb-3 sm:mb-4 px-4">
            Browse Items
          </h1>
          <p className="text-lg sm:text-xl text-light-green-700 max-w-2xl mx-auto px-4">
            Discover free items and amazing deals from Cate students and faculty
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-green-700 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items, brands, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-base"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-light-green-100 text-light-green-700 rounded-lg hover:bg-light-green-200 transition-colors min-h-[48px] touch-manipulation"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-primary-100">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setSelectedSubcategory('')
                    }}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Filter */}
                {selectedCategory && (
                  <div>
                    <label className="block text-sm font-medium text-light-green-800 mb-2">Subcategory</label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                    >
                      <option value="">All Subcategories</option>
                      {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.map(subcategory => (
                        <option key={subcategory} value={subcategory}>{subcategory}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Condition</label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Conditions</option>
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Sizes</option>
                    {sizes.map(size => (
                      <option key={size} value={size as string}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Status</option>
                    {Object.entries(ITEM_STATUS).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Listing Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-light-green-800 mb-2">Listing Type</label>
                  <select
                    value={selectedListingType}
                    onChange={(e) => setSelectedListingType(e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors"
                  >
                    <option value="">All Types</option>
                    {Object.entries(LISTING_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-light-green-700 hover:text-light-green-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-light-green-700">
            Showing {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <Link key={item.id} href={`/item/${item.id}`} className="block">
              <div className="card-primary group">
              <div className="relative">
                <div className="aspect-[4/5] bg-gradient-to-br from-primary-100 to-secondary-100 rounded-t-2xl overflow-hidden">
                  <HEICImage
                    src={item.images[0] || '/api/placeholder/400/500'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {item.is_traded && (
                  <div className="absolute top-4 right-4 bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Traded
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    {!item.is_traded ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleChatRequest(item)
                        }}
                        className="bg-white/90 backdrop-blur-sm text-light-green-700 px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-white transition-colors flex items-center gap-2 text-sm sm:text-base touch-manipulation min-h-[44px]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message Seller
                      </button>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-sm text-light-green-700 px-6 py-2 rounded-full font-medium flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Already Traded
                      </div>
                    )}
                    
                    {user && (
                      <WishlistButton 
                        itemId={item.id}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-elegant font-semibold text-light-green-800 text-lg">
                    {item.name}
                  </h3>
                  {item.size && (
                    <span className="text-sm text-light-green-800 bg-light-green-200 px-2 py-1 rounded-full">
                      {item.size}
                    </span>
                  )}
                </div>

                {/* Price Display for For Sale Items */}
                {item.listing_type === 'for_sale' && item.price && (
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-green-600">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="ml-2 text-xs text-light-green-700 bg-green-100 px-2 py-1 rounded-full">
                      For Sale
                    </span>
                  </div>
                )}
                
                {item.listing_type === 'free' && (
                  <div className="mb-3">
                    <span className="text-lg font-semibold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                      Free
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-light-green-800 bg-light-green-200 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                  {item.subcategory && (
                    <span className="text-xs text-light-green-800 bg-light-green-200 px-2 py-1 rounded-full">
                      {item.subcategory}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'available' ? 'text-green-600 bg-green-100' :
                    item.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
                  }`}>
                    {ITEM_STATUS[item.status as keyof typeof ITEM_STATUS] || item.status}
                  </span>
                </div>
                
                <p className="text-light-green-700 font-medium mb-2">{item.brand}</p>
                <p className="text-light-green-700 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-light-green-700">
                  <span className="bg-light-green-200 px-2 py-1 rounded-full text-light-green-800">
                    {item.condition}
                  </span>
                  <span>by @{item.profiles.username}</span>
                </div>
              </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-light-green-700" />
            </div>
            <h3 className="text-2xl font-elegant font-semibold text-light-green-800 mb-2">
              No items found
            </h3>
            <p className="text-light-green-700 mb-6">
              Try adjusting your search or filters
            </p>
            <Link href="/list" className="btn-primary">
              List Your First Item
            </Link>
          </div>
        )}
      </div>

      {/* Direct Messaging Modal */}
      {selectedItem && (
        <DirectMessagingModal
          isOpen={showChatModal}
          onClose={() => {
            setShowChatModal(false)
            setSelectedItem(null)
          }}
          recipientId={selectedItem.user_id}
          recipientUsername={selectedItem.profiles.username}
          item={{
            id: selectedItem.id,
            name: selectedItem.name,
            brand: selectedItem.brand,
            images: selectedItem.images,
            listing_type: selectedItem.listing_type,
            price: selectedItem.price
          }}
        />
      )}

      {/* SmartMatch AI Section */}
      <SmartMatchSection />
    </div>
  )
}
