import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore.js'

function FullscreenPanel({ eyebrow, title, copy }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f2f6_0%,#f4efee_32%,#f7f3f1_100%)] px-6 py-10 text-ink-950">
      <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
        <section className="surface-card w-full p-8 text-center">
          <p className="section-eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-[-0.05em] text-ink-950">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-ink-600">{copy}</p>
        </section>
      </div>
    </div>
  )
}

export function RequireAuth({ children }) {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    if (status === 'idle') {
      bootstrap()
    }
  }, [bootstrap, status])

  if (status === 'idle' || status === 'bootstrapping' || status === 'loading') {
    return (
      <FullscreenPanel
        copy="Checking your session and preparing the admin workspace."
        eyebrow="Session"
        title="Connecting"
      />
    )
  }

  if (status !== 'authenticated') {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return children
}

export function GuestOnly({ children }) {
  const status = useAuthStore((state) => state.status)
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    if (status === 'idle') {
      bootstrap()
    }
  }, [bootstrap, status])

  if (status === 'idle' || status === 'bootstrapping') {
    return (
      <FullscreenPanel
        copy="Looking for an existing admin session before showing the auth flow."
        eyebrow="Auth"
        title="Loading"
      />
    )
  }

  if (status === 'authenticated') {
    return <Navigate replace to="/admin/dashboard" />
  }

  return children
}
