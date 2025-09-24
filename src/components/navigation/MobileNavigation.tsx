'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Home, Search, Plus, MessageSquare, Heart, User, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/browse', icon: Search, label: 'Browse' },
    { href: '/list', icon: Plus, label: 'List Item' },
    { href: '/trades', icon: MessageSquare, label: 'Trades' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-coquette-pink-600 hover:bg-coquette-pink-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img 
                      src="/cate-logo.svg" 
                      alt="Cate School Logo" 
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <h1 className="text-xl font-elegant font-semibold text-primary-700">
                    TakeItAndLeaveIt
                  </h1>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-primary-400 hover:bg-primary-50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-coquette-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-coquette-pink-50 hover:text-coquette-pink-600 transition-colors group"
                    >
                      <Icon className="w-5 h-5 group-hover:text-coquette-pink-500" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Auth Section */}
              <div className="p-6 border-t border-coquette-pink-100">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-primary text-center block"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-outline text-center block"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
