import axios from 'axios'
import { getApiUrl, retryWithNextApiUrl, setActiveApiUrl } from './base-url.js'

export const API_URL = getApiUrl()

const authClient = axios.create({
  withCredentials: true,
  timeout: 1500,
})

authClient.interceptors.request.use((config) => {
  config.baseURL = getApiUrl()
  return config
})

authClient.interceptors.response.use(
  (response) => {
    setActiveApiUrl(response.config.baseURL)
    return response
  },
  (error) => retryWithNextApiUrl(error, authClient),
)

function unwrap(response) {
  return response.data.data
}

export async function loginRequest(payload) {
  const response = await authClient.post('/api/auth/login', payload)
  return unwrap(response)
}

export async function signupRequest(payload) {
  const response = await authClient.post('/api/auth/signup', payload)
  return unwrap(response)
}

export async function refreshSessionRequest() {
  const response = await authClient.post('/api/auth/refresh', {})
  return unwrap(response)
}

export async function getCurrentUserRequest(accessToken) {
  const response = await authClient.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return unwrap(response)
}

export async function logoutRequest(accessToken) {
  await authClient.post(
    '/api/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
}
