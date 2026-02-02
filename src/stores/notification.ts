import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  function addNotification(
    message: string,
    type: Notification['type'] = 'info',
    duration = 3000
  ) {
    const id = Date.now().toString() + Math.random().toString(36)
    const notification: Notification = { id, type, message, duration }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(message: string, duration?: number) {
    return addNotification(message, 'success', duration)
  }

  function error(message: string, duration?: number) {
    return addNotification(message, 'error', duration)
  }

  function warning(message: string, duration?: number) {
    return addNotification(message, 'warning', duration)
  }

  function info(message: string, duration?: number) {
    return addNotification(message, 'info', duration)
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info
  }
})
