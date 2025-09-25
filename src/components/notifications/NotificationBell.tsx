'use client'

import { useState, useEffect } from 'react'
import { Bell, X, MessageCircle, Handshake, ShoppingBag, Star, CheckCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase-client'
import { notificationService, showNotificationWithTemplate, notificationTemplates } from '@/lib/notifications'
import { Database } from '@/lib/supabase'

type Notification = Database['public']['Tables']['notifications']['Row']

const notificationIcons = {
  chat_message: MessageCircle,
  trade_request: Handshake,
  trade_accepted: CheckCircle,
  trade_declined: X,
  item_sold: ShoppingBag,
  item_bought: ShoppingBag,
  recommendation: Star,
}

const notificationColors = {
  chat_message: 'text-blue-500',
  trade_request: 'text-yellow-500',
  trade_accepted: 'text-green-500',
  trade_declined: 'text-red-500',
  item_sold: 'text-purple-500',
  item_bought: 'text-purple-500',
  recommendation: 'text-pink-500',
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        setNotifications(data || [])
        setUnreadCount((data || []).filter((n: Notification) => !n.is_read).length)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Notification }) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show browser notification if permission granted
          if (notificationService.getPermission() === 'granted') {
            showNotificationWithTemplate(
              newNotification.type as keyof typeof notificationTemplates,
              newNotification.message,
              newNotification.title
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
      if (unreadIds.length === 0) return

      await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', unreadIds)

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestPermission()
    if (granted) {
      console.log('Notification permission granted')
    }
  }

  if (!user) return null

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          requestNotificationPermission()
        }}
        className="relative p-2 text-primary-600 hover:text-primary-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-primary-100 py-2 z-[60] max-h-96 overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-2 border-b border-primary-100 flex items-center justify-between">
              <h3 className="font-elegant font-semibold text-primary-800">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-primary-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-primary-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type]
                  const iconColor = notificationColors[notification.type]
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id)
                        if (notification.action_url) {
                          window.location.href = notification.action_url
                        }
                      }}
                      className={`px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-primary-50 last:border-b-0 ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-900 truncate">
                            {notification.title}
                          </p>
                          <p className="text-sm text-primary-700 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-primary-600 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()} at{' '}
                            {new Date(notification.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
