'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to home
          router.push('/')
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-periwinkle flex items-center justify-center">
      <div className="card-primary p-8 text-center">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-elegant font-semibold text-primary-800 mb-2">
          Verifying your email...
        </h2>
        <p className="text-primary-600">
          Please wait while we confirm your account.
        </p>
      </div>
    </div>
  )
}
