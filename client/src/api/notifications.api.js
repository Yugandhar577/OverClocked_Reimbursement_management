import { api } from './http.js'

export async function getNotifications(params = {}) {
  const response = await api.get('/api/notifications', { params })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
    unreadCount: response.data.unreadCount ?? 0,
  }
}

export async function markNotificationAsRead(notificationId) {
  const response = await api.patch(`/api/notifications/${notificationId}/read`)
  return response.data.data
}

export async function markAllNotificationsAsRead() {
  const response = await api.patch('/api/notifications/read-all')
  return response.data.data
}
