import { create } from 'zustand'
import {
  getCurrentUserRequest,
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  signupRequest,
} from '../api/auth.api.js'

const anonymousState = {
  accessToken: null,
  company: null,
  user: null,
  status: 'anonymous',
}

const BOOTSTRAP_TIMEOUT_MS = 6000

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session bootstrap timed out')), timeoutMs)
    }),
  ])
}

export const useAuthStore = create((set, get) => ({
  ...anonymousState,
  status: 'idle',
  setAccessToken: (accessToken) => set({ accessToken }),
  setSession: ({ accessToken, company, user }) =>
    set({
      accessToken,
      company,
      user,
      status: 'authenticated',
    }),
  clearSession: () => set({ ...anonymousState }),
  async bootstrap() {
    const currentStatus = get().status

    if (currentStatus !== 'idle' && currentStatus !== 'anonymous') {
      return
    }

    set({ status: 'bootstrapping' })

    try {
      const session = await withTimeout(refreshSessionRequest(), BOOTSTRAP_TIMEOUT_MS)
      const user = await withTimeout(
        getCurrentUserRequest(session.accessToken),
        BOOTSTRAP_TIMEOUT_MS,
      )

      set({
        accessToken: session.accessToken,
        company: user.company,
        user,
        status: 'authenticated',
      })
    } catch {
      set({ ...anonymousState })
    }
  },
  async login(credentials) {
    set({ status: 'loading' })

    try {
      const session = await loginRequest(credentials)

      set({
        accessToken: session.accessToken,
        company: session.company,
        user: session.user,
        status: 'authenticated',
      })

      return session
    } catch (error) {
      set({ ...anonymousState })
      throw error
    }
  },
  async signup(payload) {
    set({ status: 'loading' })

    try {
      const session = await signupRequest(payload)

      set({
        accessToken: session.accessToken,
        company: session.company,
        user: session.user,
        status: 'authenticated',
      })

      return session
    } catch (error) {
      set({ ...anonymousState })
      throw error
    }
  },
  async logout() {
    const token = get().accessToken

    try {
      if (token) {
        await logoutRequest(token)
      }
    } finally {
      set({ ...anonymousState })
    }
  },
}))
