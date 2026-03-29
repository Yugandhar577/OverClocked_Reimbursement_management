import axios from 'axios'
import { refreshSessionRequest } from './auth.api.js'
import { getApiUrl, retryWithNextApiUrl, setActiveApiUrl } from './base-url.js'
import { useAuthStore } from '../stores/useAuthStore.js'

export const api = axios.create({
  withCredentials: true,
  timeout: 1500,
})

let refreshPromise = null

api.interceptors.request.use((config) => {
  config.baseURL = getApiUrl()
  const token = useAuthStore.getState().accessToken

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    setActiveApiUrl(response.config.baseURL)
    return response
  },
  async (error) => {
    if (!error.response) {
      return retryWithNextApiUrl(error, api)
    }

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
