'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import MobileNavigation from './MobileNavigation'
import { getProfile } from '@/lib/database'
import NotificationBell from '@/components/notifications/NotificationBell'
import { User, LogOut } from 'lucide-react'

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export default function Navigation() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getProfile(user.id)
          setProfile(profileData)
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      }
    }
    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    setShowUserMenu(false)
    setProfile(null) // Clear profile data immediately
    
    try {
      await signOut()
      
      // Clear all state and force reload
      if (typeof window !== 'undefined') {
        // Use replace instead of href to prevent back button from going to authenticated state
        window.location.replace('/')
      }
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if signOut fails, force reload to clear state
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 min-w-0">
            <Link href="/" className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🐏</span>
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-elegant font-semibold text-primary-700 truncate">
                TakeItAndLeaveIt
              </h1>
            </Link>
          </div>

          {/* Center section - Navigation on desktop, Auth buttons on mobile */}
          <div className="flex-1 flex justify-center">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors">
                Home
              </Link>
              <Link href="/browse" className="text-primary-600 hover:text-primary-700 transition-colors">
                Browse
              </Link>
              <Link href="/list" className="text-primary-600 hover:text-primary-700 transition-colors">
                List Item
              </Link>
              <Link href="/trades" className="text-primary-600 hover:text-primary-700 transition-colors">
                Trades
              </Link>
              {user && (
                <>
                  <Link href="/messages" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Messages
                  </Link>
                  <Link href="/wishlist" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Wishlist
                  </Link>
                  <Link href="/profile" className="text-primary-600 hover:text-primary-700 transition-colors">
                    Profile
                  </Link>
                </>
              )}
            </nav>
            
            {/* Auth buttons - centered on mobile, hidden on desktop */}
            {!user && (
              <div className="flex items-center space-x-2 md:hidden">
                <Link href="/auth/login" className="btn-outline text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {user ? (
              <>
                <div className="hidden sm:block">
                  <NotificationBell />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="hidden lg:block text-sm font-medium">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary-100 py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login" className="btn-outline text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  )
}
