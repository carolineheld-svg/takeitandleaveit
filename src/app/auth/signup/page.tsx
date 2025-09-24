'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signUp(email, password, username)
      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-periwinkle py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-elegant font-bold text-primary-800 mb-2">
            Join the Community
          </h2>
          <p className="text-primary-600">
            Create your TakeItAndLeaveIt account
          </p>
          <p className="text-sm text-primary-500 mt-2">
            Only @cate.org email addresses are allowed
          </p>
        </div>

        <div className="card-primary p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary-800 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-gray-700"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-gray-700"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-800 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors text-gray-700"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-700 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
