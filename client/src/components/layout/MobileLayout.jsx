import { Bell, ChevronLeft } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getNotifications } from '../../api/notifications.api.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { BottomNavBar } from './BottomNavBar.jsx'

const titleMatchers = [
  { pattern: /^\/expenses\/new$/, title: 'New Expense', copy: 'Draft, scan, and submit expenses on the move.' },
  { pattern: /^\/expenses\/[^/]+$/, title: 'Expense Detail', copy: 'Track status, receipts, and conversation history.' },
  { pattern: /^\/expenses$/, title: 'My Expenses', copy: 'Monitor personal claims and reimbursement progress.' },
  { pattern: /^\/scan$/, title: 'Scan Receipt', copy: 'Capture a receipt and turn it into a draft.' },
  { pattern: /^\/approvals\/[^/]+$/, title: 'Approval Detail', copy: 'Review the claim, add context, and decide.' },
  { pattern: /^\/approvals$/, title: 'Approval Queue', copy: 'Prioritize the claims waiting on your action.' },
  { pattern: /^\/team-expenses$/, title: 'Team Expenses', copy: 'Stay close to the team’s latest reimbursements.' },
  { pattern: /^\/profile$/, title: 'Profile', copy: 'Check your role, company, and notification state.' },
]

function resolveHeader(pathname) {
  return (
    titleMatchers.find((item) => item.pattern.test(pathname)) ?? {
      title: 'Workspace',
      copy: 'Move through employee and manager flows without leaving the mobile shell.',
    }
  )
}

export function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    getNotifications({ limit: 5 })
      .then((result) => {
        if (!cancelled) {
          setUnreadCount(result.unreadCount ?? 0)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUnreadCount(0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [location.pathname])

  const header = useMemo(() => resolveHeader(location.pathname), [location.pathname])
  const canGoBack = location.pathname !== '/expenses' && location.pathname !== '/approvals'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f9f2f6_0%,#f7f0ef_40%,#f7f3f1_100%)] text-ink-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="mb-6 rounded-[30px] border border-white/70 bg-white/90 px-4 py-4 shadow-card backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {canGoBack ? (
                <button
                  className="mt-1 rounded-2xl bg-brand-50 p-2 text-brand-900 transition hover:bg-brand-100"
                  onClick={() => navigate(-1)}
                  type="button"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-900 font-display text-sm font-bold text-white shadow-soft">
                  {user?.firstName?.[0] ?? 'R'}
                </div>
              )}

              <div className="min-w-0">
                <p className="section-eyebrow">{user?.role === 'MANAGER' ? 'Manager Mobile' : 'Employee Mobile'}</p>
                <h1 className="mt-1 truncate font-display text-[1.75rem] font-black tracking-[-0.05em] text-ink-950">
                  {header.title}
                </h1>
                <p className="mt-1 text-sm leading-6 text-ink-600">{header.copy}</p>
              </div>
            </div>

            <div className="relative rounded-2xl bg-aqua-50 p-2 text-aqua-700">
              <Bell className="h-5 w-5" />
              {unreadCount ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-900 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <BottomNavBar />
    </div>
  )
}
