import { api } from './http.js'

export async function getNotifications(params = {}) {
  const response = await api.get('/api/notifications', { params })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
    unreadCount: response.data.unreadCount ?? 0,
  }
}
