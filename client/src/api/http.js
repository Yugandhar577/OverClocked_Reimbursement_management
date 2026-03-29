import axios from 'axios'
import { refreshSessionRequest, API_URL } from './auth.api.js'
import { useAuthStore } from '../stores/useAuthStore.js'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

let refreshPromise = null

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url ?? '').includes('/api/auth/')
    ) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshSessionRequest()
            .then((session) => {
              useAuthStore.getState().setAccessToken(session.accessToken)
              return session.accessToken
            })
            .finally(() => {
              refreshPromise = null
            })
        }

        const token = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearSession()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export function unwrap(response) {
  return response.data.data
}
