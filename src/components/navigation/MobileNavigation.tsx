'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Menu, X, Home, Search, Plus, MessageSquare, MessageCircle, Heart, User, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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
    { href: '/messages', icon: MessageCircle, label: 'Messages' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ml-2"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu Overlay - Rendered via Portal */}
      {mounted && isOpen && createPortal((
        <div 
          className="md:hidden"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999
          }}
        >
          {/* Backdrop */}
          <div 
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999998
            }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            style={{ 
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '320px',
              maxWidth: '90vw',
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflowY: 'auto',
              zIndex: 999999
            }}
          >
            <div className="flex flex-col h-full relative z-[99999]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-200 relative z-[99999]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img 
                      src="/favicon-32x32.png" 
                      alt="TakeItAndLeaveIt Logo" 
                      className="w-6 h-6"
                    />
                  </div>
                  <h1 className="text-lg font-elegant font-semibold text-primary-700 truncate">
                    TakeItAndLeaveIt
                  </h1>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-6 border-b border-primary-100 relative z-[99999]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-500">
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
                      <p className="font-medium text-primary-900 truncate">
                        {user.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-primary-700 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-4 space-y-1 relative z-[99999]">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 rounded-lg text-primary-700 hover:bg-primary-50 hover:text-primary-800 transition-colors group touch-manipulation min-h-[48px] text-base relative z-[99999]"
                    >
                      <Icon className="w-5 h-5 group-hover:text-primary-800 flex-shrink-0" />
                      <span className="font-medium truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Auth Section */}
              <div className="p-6 border-t border-primary-100 relative z-[99999]">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors group touch-manipulation min-h-[48px] text-base relative z-[99999]"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-primary text-center block min-h-[48px] flex items-center justify-center relative z-[99999]"
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-outline text-center block min-h-[48px] flex items-center justify-center relative z-[99999]"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ), document.body)}
    </>
  )
}
