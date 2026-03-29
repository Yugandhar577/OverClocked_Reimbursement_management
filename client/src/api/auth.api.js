import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const authClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

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
