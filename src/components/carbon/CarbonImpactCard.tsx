'use client'

import { useState, useEffect } from 'react'
import { Leaf, Droplets, Recycle, TrendingUp, Award } from 'lucide-react'
import { CarbonFootprintService, CampusCarbonImpact } from '@/lib/carbon-footprint'

interface CarbonImpactCardProps {
  userId?: string
  showPersonal?: boolean
  showCampus?: boolean
}

export default function CarbonImpactCard({ 
  userId, 
  showPersonal = true, 
  showCampus = true 
}: CarbonImpactCardProps) {
  const [personalData, setPersonalData] = useState({
    totalCo2Saved: 0,
    totalWaterSaved: 0,
    totalWasteDiverted: 0,
    totalTrades: 0
  })
  const [campusData, setCampusData] = useState<CampusCarbonImpact | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (showPersonal && userId) {
          const personal = await CarbonFootprintService.getUserCarbonSavings(userId)
          setPersonalData(personal)
        }
        
        if (showCampus) {
          const campus = await CarbonFootprintService.getCampusCarbonImpact()
          setCampusData(campus)
        }
      } catch (error) {
        console.error('Error fetching carbon impact data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, showPersonal, showCampus])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-primary p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number, decimals: number = 1) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(decimals)}k`
    }
    return num.toFixed(decimals)
  }

  const getImpactLevel = (co2: number) => {
    if (co2 >= 50) return { level: 'Eco Champion', color: 'text-green-600', bg: 'bg-green-100' }
    if (co2 >= 20) return { level: 'Green Trader', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (co2 >= 5) return { level: 'Eco Starter', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Getting Started', color: 'text-primary-600', bg: 'bg-primary-100' }
  }

  return (
    <div className="space-y-6">
      {/* Personal Impact */}
      {showPersonal && userId && (
        <div className="bg-white rounded-2xl shadow-primary p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-elegant font-semibold text-primary-800">
                Your Environmental Impact
              </h3>
              <p className="text-sm text-primary-600">
                {getImpactLevel(personalData.totalCo2Saved).level}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(personalData.totalCo2Saved)}
              </div>
              <div className="text-xs text-green-600">kg CO₂ Saved</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(personalData.totalWaterSaved)}
              </div>
              <div className="text-xs text-blue-600">L Water Saved</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Recycle className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(personalData.totalWasteDiverted)}
              </div>
              <div className="text-xs text-purple-600">kg Waste Diverted</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {personalData.totalTrades}
              </div>
              <div className="text-xs text-orange-600">Trades Completed</div>
            </div>
          </div>

          {personalData.totalCo2Saved > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Impact Equivalent</span>
              </div>
              <p className="text-sm text-green-700">
                Your trading has saved the equivalent of planting approximately{' '}
                <span className="font-semibold">
                  {Math.round(personalData.totalCo2Saved / 2.5)} trees
                </span>
                {' '}and prevented{' '}
                <span className="font-semibold">
                  {Math.round(personalData.totalCo2Saved / 22)} car miles
                </span>
                {' '}of emissions!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Campus Impact */}
      {showCampus && campusData && (
        <div className="bg-white rounded-2xl shadow-primary p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-elegant font-semibold text-primary-800">
                Campus Environmental Impact
              </h3>
              <p className="text-sm text-primary-600">
                Collective impact of all Cate traders
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">
                {formatNumber(campusData.total_co2_saved_kg, 0)}
              </div>
              <div className="text-sm text-green-600">kg CO₂ Saved</div>
              <div className="text-xs text-primary-600 mt-1">
                ≈ {Math.round(campusData.total_co2_saved_kg / 2.5)} trees
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(campusData.total_water_saved_liters, 0)}
              </div>
              <div className="text-sm text-blue-600">L Water Saved</div>
              <div className="text-xs text-primary-600 mt-1">
                ≈ {Math.round(campusData.total_water_saved_liters / 2000)} showers
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">
                {campusData.total_trades_completed}
              </div>
              <div className="text-sm text-purple-600">Trades Completed</div>
              <div className="text-xs text-primary-600 mt-1">
                {campusData.active_traders_count} active traders
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Campus Achievement</span>
            </div>
            <p className="text-sm text-blue-700">
              Together, Cate traders have prevented{' '}
              <span className="font-semibold">
                {Math.round(campusData.total_co2_saved_kg / 22)} car miles
              </span>
              {' '}of emissions and saved enough water for{' '}
              <span className="font-semibold">
                {Math.round(campusData.total_water_saved_liters / 15000)} months
              </span>
              {' '}of household use!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
