'use client'

import { useState, useEffect } from 'react'
import { Trophy, Award, Medal, Crown } from 'lucide-react'
import { CarbonFootprintService } from '@/lib/carbon-footprint'

interface LeaderboardEntry {
  user_id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  total_co2_saved: number
  total_trades: number
}

export default function CarbonLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const data = await CarbonFootprintService.getCarbonSavingsLeaderboard(10)
        setLeaderboard(data)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Trophy className="w-6 h-6 text-gray-400" />
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <Award className="w-5 h-5 text-gray-400" />
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'
      case 2:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200'
      default:
        return 'bg-white border-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-primary p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-primary p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-coquette font-semibold text-gray-700 mb-2">
          No Trading Data Yet
        </h3>
        <p className="text-gray-600">
          Start trading to see who's making the biggest environmental impact!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-primary p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-coquette font-semibold text-gray-800">
            Eco Impact Leaderboard
          </h3>
          <p className="text-sm text-gray-600">
            Top environmental champions on campus
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((user, index) => (
          <div
            key={user.user_id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md ${getRankColor(index)}`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
              {getRankIcon(index)}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-coquette-pink-400 to-coquette-gold-400 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {user.full_name || user.username}
                </div>
                <div className="text-sm text-gray-600">@{user.username}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {user.total_co2_saved.toFixed(1)} kg
              </div>
              <div className="text-xs text-gray-500">
                {user.total_trades} trades
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-green-600" />
          <span className="font-medium text-green-800">How to Climb the Leaderboard</span>
        </div>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Complete trades to save CO₂ emissions</li>
          <li>• Trade high-impact items (electronics, clothing)</li>
          <li>• Encourage friends to join the platform</li>
          <li>• List items you no longer need</li>
        </ul>
      </div>
    </div>
  )
}
