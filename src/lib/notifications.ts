// Push notification service for browser notifications
export class NotificationService {
  private static instance: NotificationService
  private permission: NotificationPermission = 'default'

  private constructor() {
    this.permission = 'Notification' in window ? Notification.permission : 'denied'
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  public showNotification(title: string, options?: NotificationOptions): void {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon-32x32.png',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      // Handle click
      notification.onclick = () => {
        window.focus()
        if (options?.tag) {
          // Navigate to specific page based on notification type
          this.handleNotificationClick(options.tag)
        }
        notification.close()
      }

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

  private handleNotificationClick(tag: string): void {
    // Parse notification type from tag and navigate accordingly
    const notificationType = tag.split('-')[0]
    
    switch (notificationType) {
      case 'trade_request':
      case 'trade_accepted':
      case 'trade_declined':
      case 'chat_message':
        window.location.href = '/trades'
        break
      case 'item_sold':
      case 'item_bought':
        window.location.href = '/profile'
        break
      case 'recommendation':
        window.location.href = '/browse'
        break
      default:
        window.location.href = '/'
    }
  }

  public isSupported(): boolean {
    return 'Notification' in window
  }

  public getPermission(): NotificationPermission {
    return this.permission
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()

// Notification templates
export const notificationTemplates = {
  trade_request: {
    title: 'New Trade Request',
    body: 'You received a new trade request!',
    icon: '/favicon.ico'
  },
  trade_accepted: {
    title: 'Trade Request Accepted',
    body: 'Your trade request has been accepted!',
    icon: '/favicon.ico'
  },
  trade_declined: {
    title: 'Trade Request Declined',
    body: 'Your trade request has been declined.',
    icon: '/favicon.ico'
  },
  chat_message: {
    title: 'New Message',
    body: 'You received a new message about your trade.',
    icon: '/favicon.ico'
  },
  item_sold: {
    title: 'Item Sold',
    body: 'Your item has been successfully traded!',
    icon: '/favicon.ico'
  },
  item_bought: {
    title: 'Item Purchased',
    body: 'You successfully traded for an item!',
    icon: '/favicon.ico'
  },
  recommendation: {
    title: 'New Recommendations',
    body: 'Check out these items we think you\'ll love!',
    icon: '/favicon.ico'
  }
}

// Helper function to show notification with template
export function showNotificationWithTemplate(
  type: keyof typeof notificationTemplates,
  customMessage?: string,
  customTitle?: string
): void {
  const template = notificationTemplates[type]
  notificationService.showNotification(customTitle || template.title, {
    body: customMessage || template.body,
    icon: template.icon,
    tag: `${type}-${Date.now()}`
  })
}
