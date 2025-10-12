'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Package, Edit3, Trash2, Camera, Save, X, Shirt } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getProfile, getItemsByUser, deleteItem, updateProfile } from '@/lib/database'
import { uploadProfilePicture, deleteProfilePicture } from '@/lib/supabase-storage'
import DeleteItemModal from '@/components/item/DeleteItemModal'
import SizePreferencesModal from '@/components/profile/SizePreferencesModal'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  venmo_username: string | null
  zelle_username: string | null
}

interface UserItem {
  id: string
  name: string
  brand: string
  condition: string
  size: string | null
  images: string[]
  is_traded: boolean
  created_at: string
  listing_type: 'free' | 'for_sale'
  price: number | null
  payment_methods: string[]
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: UserItem | null }>({
    isOpen: false,
    item: null
  })
  const [deleting, setDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [sizePreferencesModal, setSizePreferencesModal] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    avatar_url: '',
    venmo_username: '',
    zelle_username: ''
  })
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        const [profileData, itemsData] = await Promise.all([
          getProfile(user.id),
          getItemsByUser(user.id)
        ])
        
        setProfile(profileData)
        setUserItems(itemsData)
        
        // Initialize edit form with current profile data
        if (profileData) {
          setEditForm({
            full_name: profileData.full_name || '',
            avatar_url: profileData.avatar_url || '',
            venmo_username: profileData.venmo_username || '',
            zelle_username: profileData.zelle_username || ''
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-blue">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-blue-700 font-elegant text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  const handleDeleteItem = (item: UserItem) => {
    setDeleteModal({ isOpen: true, item })
  }

  const confirmDelete = async () => {
    if (!deleteModal.item) return

    setDeleting(true)
    try {
      await deleteItem(deleteModal.item.id)
      setUserItems(prev => prev.filter(item => item.id !== deleteModal.item!.id))
      setDeleteModal({ isOpen: false, item: null })
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null })
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setProfilePictureFile(null)
    setProfilePicturePreview(null)
    // Reset form to original profile data
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        venmo_username: profile.venmo_username || '',
        zelle_username: profile.zelle_username || ''
      })
    }
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePictureFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfilePicturePreview(previewUrl)
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !profile) return
    
    setUpdating(true)
    try {
      let avatarUrl = editForm.avatar_url
      
      // Upload new profile picture if one was selected
      if (profilePictureFile) {
        // Delete old profile picture if it exists
        if (profile.avatar_url) {
          try {
            await deleteProfilePicture(profile.avatar_url)
          } catch (error) {
            console.warn('Failed to delete old profile picture:', error)
          }
        }
        
        // Upload new profile picture
        avatarUrl = await uploadProfilePicture(profilePictureFile, user.id)
      }
      
      // Update profile in database
      const updatedProfile = await updateProfile(user.id, {
        full_name: editForm.full_name || null,
        avatar_url: avatarUrl,
        venmo_username: editForm.venmo_username || null,
        zelle_username: editForm.zelle_username || null
      })
      
      setProfile(updatedProfile)
      setIsEditing(false)
      setProfilePictureFile(null)
      setProfilePicturePreview(null)
      
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Failed to update profile:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to update profile: ${errorMessage}\n\nMake sure you've run the database migration!`)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-light-blue">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-light-blue-700 font-elegant text-xl">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light-blue py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-elegant font-bold text-light-blue-800 mb-4">
            My Profile
          </h1>
          <p className="text-xl text-light-blue-700">
            Manage your listings, payment preferences, and account settings
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="card-primary p-6 sticky top-8">
              {!isEditing ? (
                // View Mode
                <>
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <h2 className="text-2xl font-elegant font-bold text-light-blue-800 mb-2">
                      {profile?.username || 'User'}
                    </h2>
                    <p className="text-light-blue-700 mb-4">
                      {profile?.full_name || 'No name set'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-light-blue-600">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-light-blue-600">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm">
                        Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-light-blue-600">
                      <Package className="w-5 h-5" />
                      <span className="text-sm">{userItems.length} items listed</span>
                    </div>
                    
                    {(profile?.venmo_username || profile?.zelle_username) && (
                      <div className="pt-3 border-t border-primary-200">
                        <p className="text-sm font-semibold text-primary-700 mb-2">Payment Info:</p>
                        {profile.venmo_username && (
                          <div className="text-sm text-light-blue-600 mb-1">
                            <span className="font-medium">Venmo:</span> {profile.venmo_username}
                          </div>
                        )}
                        {profile.zelle_username && (
                          <div className="text-sm text-light-blue-600">
                            <span className="font-medium">Zelle:</span> {profile.zelle_username}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleEditProfile}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setSizePreferencesModal(true)}
                      className="flex-1 bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Shirt className="w-4 h-4" />
                      Size Preferences
                    </button>
                  </div>
                </>
              ) : (
                // Edit Mode
                <>
                  <div className="text-center mb-6">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <div className="w-24 h-24 bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 rounded-full flex items-center justify-center overflow-hidden">
                        {profilePicturePreview || profile?.avatar_url ? (
                          <img 
                            src={profilePicturePreview || profile?.avatar_url || ''} 
                            alt="Profile" 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="w-12 h-12 text-white" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                        <Camera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <h2 className="text-2xl font-elegant font-bold text-light-blue-800 mb-2">
                      {profile?.username || 'User'}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-800 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-800 mb-2">
                        Venmo Username (Optional)
                      </label>
                      <input
                        type="text"
                        value={editForm.venmo_username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, venmo_username: e.target.value }))}
                        placeholder="@your-venmo"
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-primary-600 mt-1">For accepting Venmo payments</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-800 mb-2">
                        Zelle Email/Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={editForm.zelle_username}
                        onChange={(e) => setEditForm(prev => ({ ...prev, zelle_username: e.target.value }))}
                        placeholder="your@email.com or 123-456-7890"
                        className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-primary-600 mt-1">For accepting Zelle payments</p>
                    </div>

                    <div className="flex items-center gap-3 text-light-blue-600 text-sm pt-2 border-t border-primary-100">
                      <Mail className="w-4 h-4" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-light-blue-600 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-light-blue-600 text-sm">
                      <Package className="w-4 h-4" />
                      <span>{userItems.length} items listed</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updating}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {updating ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* User's Items */}
          <div className="lg:col-span-2">
            <div className="card-primary p-6">
              <h3 className="text-2xl font-elegant font-bold text-light-blue-800 mb-6">
                My Listed Items
              </h3>

              {userItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-primary-500" />
                  </div>
                  <h4 className="text-xl font-elegant font-semibold text-primary-800 mb-2">
                    No items yet
                  </h4>
                  <p className="text-primary-600 mb-6">
                    Start your trading journey by listing your first item!
                  </p>
                  <a href="/list" className="btn-primary">
                    List Your First Item
                  </a>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {userItems.map((item) => (
                    <div key={item.id} className="card-coquette-hover">
                      <div className="relative">
                        <div className="aspect-[4/5] bg-gradient-to-br from-coquette-pink-100 to-coquette-gold-100 rounded-t-2xl overflow-hidden">
                          <img
                            src={item.images[0] || '/api/placeholder/400/500'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {item.is_traded && (
                          <div className="absolute top-4 right-4 bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Traded
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-elegant font-semibold text-light-blue-800 text-lg">
                            {item.name}
                          </h4>
                          {item.size && (
                            <span className="text-sm text-light-blue-700 bg-light-blue-200 px-2 py-1 rounded-full">
                              {item.size}
                            </span>
                          )}
                        </div>

                        {/* Price Display */}
                        {item.listing_type === 'for_sale' && item.price && (
                          <div className="mb-2">
                            <span className="text-xl font-bold text-green-600">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="ml-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                              For Sale
                            </span>
                          </div>
                        )}
                        
                        {item.listing_type === 'free' && (
                          <div className="mb-2">
                            <span className="text-sm font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                              Free
                            </span>
                          </div>
                        )}
                        
                        <p className="text-light-blue-600 font-medium mb-2">{item.brand}</p>
                        <p className="text-light-blue-600 text-sm mb-3">
                          {item.condition}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-coquette-pink-500 mb-4">
                          <span>
                            Listed {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          {item.is_traded ? (
                            <span className="text-green-600 font-medium">✓ Traded</span>
                          ) : (
                            <span className="text-light-blue-600 font-medium">Available</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link
                            href={`/edit/${item.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-coquette-pink-100 text-light-blue-600 rounded-lg hover:bg-coquette-pink-200 transition-colors text-sm font-medium"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteItemModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.item?.name || ''}
        loading={deleting}
      />

      {/* Size Preferences Modal */}
      <SizePreferencesModal
        isOpen={sizePreferencesModal}
        onClose={() => setSizePreferencesModal(false)}
        userId={user?.id || ''}
        onSave={() => {
          // Refresh profile or show success message
          console.log('Size preferences saved!')
        }}
      />
    </div>
  )
}
