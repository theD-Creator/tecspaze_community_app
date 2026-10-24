import { create } from 'zustand'
import { Notification } from '../types'
import { nanoid } from 'nanoid'

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  dismissNotification: (id: string) => void
  clearNotifications: () => void
}

const DEFAULT_DURATION = 5000

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = nanoid()
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date().toISOString(),
      duration: notification.duration ?? DEFAULT_DURATION,
    }

    set((state) => ({ notifications: [...state.notifications, newNotification] }))

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, newNotification.duration)
    }

    return id
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },

  clearNotifications: () => {
    set({ notifications: [] })
  },
}))

export const useNotification = () => {
  const state = useNotificationStore()
  return state
}

// Helper to show notifications
export const showSuccess = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'success',
    title: title || 'Success',
    message,
  })
}

export const showError = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'error',
    title: title || 'Error',
    message,
    duration: 8000,
  })
}

export const showWarning = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'warning',
    title: title || 'Warning',
    message,
    duration: 6000,
  })
}

export const showInfo = (message: string, title?: string) => {
  useNotificationStore.getState().addNotification({
    type: 'info',
    title: title || 'Info',
    message,
  })
}

export default useNotification
