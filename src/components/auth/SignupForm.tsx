'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email domain
    if (!email.endsWith('@cate.org')) {
      setError('Only @cate.org email addresses are allowed')
      setLoading(false)
      return
    }

    try {
      await signUp(email, password, username)
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card-primary p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-elegant font-bold text-primary-800 mb-4">
            Welcome to TakeItAndLeaveIt!
          </h2>
          <p className="text-primary-600 mb-6">
            Please check your email to verify your account and start trading.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="btn-outline"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card-primary p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-elegant font-bold text-primary-800 mb-2">
            Join Our Community
          </h2>
          <p className="text-primary-600">
            Create your account and start trading
          </p>
        </div>

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
                placeholder="your_username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary-800 mb-2">
              Email
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
                placeholder="your@email.com"
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
                placeholder="••••••••"
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
            <button className="text-primary-500 hover:text-primary-700 font-medium transition-colors">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
