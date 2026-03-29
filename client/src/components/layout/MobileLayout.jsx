import { LogOut, UserCircle2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsAsRead,
} from '../../api/notifications.api.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { cn } from '../../utils/cn.js'
import { NotificationBell } from '../admin/NotificationBell.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx'
import { BottomNavBar } from './BottomNavBar.jsx'

const titleMatchers = [
  {
    pattern: /^\/expenses\/new$/,
    title: 'Generate Expenses',
    copy: 'Create a reimbursable expense and attach receipts without leaving the workflow.',
  },
  {
    pattern: /^\/expenses\/[^/]+$/,
    title: 'Generate Expenses',
    copy: 'Review one expense, receipts, and discussion in the Odoo-style detail view.',
  },
  {
    pattern: /^\/expenses$/,
    title: 'My Expenses',
    copy: 'Track expenses by status, search receipts, and move drafts into approval.',
  },
  {
    pattern: /^\/scan$/,
    title: 'Scan Receipt',
    copy: 'Capture a receipt and let OCR generate the first draft.',
  },
  {
    pattern: /^\/approvals\/[^/]+$/,
    title: 'Approval Review',
    copy: 'Inspect the claim, add a rationale, and approve or reject cleanly.',
  },
  {
    pattern: /^\/approvals$/,
    title: 'Manager Dashboard',
    copy: 'Review pending approvals, queue totals, and manager actions in one place.',
  },
  {
    pattern: /^\/team-expenses$/,
    title: 'Team Expenses',
    copy: 'Browse the team feed without switching into the admin shell.',
  },
  {
    pattern: /^\/profile$/,
    title: 'Preferences',
    copy: 'Review your role, notifications, and account controls.',
  },
]

function resolveHeader(pathname) {
  return (
    titleMatchers.find((item) => item.pattern.test(pathname)) ?? {
      title: 'Expenses',
      copy: 'Operate employee and manager expense workflows in one clean workspace.',
    }
  )
}

function getDesktopNavItems(role) {
  if (role === 'EMPLOYEE') {
    return [
      { label: 'My Expenses', to: '/expenses' },
      { label: 'Create Expense', to: '/expenses/new' },
    ]
  }

  return [
    { label: 'Approvals', to: '/approvals' },
    { label: 'Team Expenses', to: '/team-expenses' },
  ]
}

function formatRoleLabel(role) {
  if (!role) {
    return 'Workspace'
  }

  return role === 'MANAGER' ? 'Manager Workspace' : 'Employee Workspace'
}

export function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    getNotifications({ limit: 6 })
      .then((result) => {
        if (!cancelled) {
          setNotifications(result.items ?? [])
          setUnreadCount(result.unreadCount ?? 0)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications([])
          setUnreadCount(0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [location.pathname])

  const header = useMemo(() => resolveHeader(location.pathname), [location.pathname])
  const navItems = useMemo(() => getDesktopNavItems(user?.role), [user?.role])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        })),
      )
      setUnreadCount(0)
    } catch {
      setUnreadCount((current) => current)
    }
  }

  if (isDesktop) {
    return (
      <div className="odoo-shell">
        <header className="odoo-topbar">
          <div className="odoo-topbar-inner">
            <div className="flex min-w-0 items-center gap-4">
              <div className="odoo-app-icon shrink-0" aria-hidden="true" />
              <span className="text-[1.65rem] font-semibold tracking-[-0.04em] text-ink-950">
                Expenses
              </span>
              <nav className="ml-2 hidden items-center gap-5 lg:flex">
                {navItems.map((item) => (
                  <NavLink
                    key={`${item.label}-${item.to}`}
                    className={({ isActive }) => cn('odoo-tab', isActive && 'odoo-tab-active')}
                    to={item.to}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell
                notifications={notifications}
                onMarkAllRead={handleMarkAllRead}
                triggerClassName="rounded-full"
                unreadCount={unreadCount}
              />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-full border border-line bg-white pl-2 pr-3 text-sm text-ink-700 shadow-soft">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-900 text-xs font-semibold text-white">
                    {(user?.firstName?.[0] ?? 'U').toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{user?.firstName ?? 'User'}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-md border-line p-2">
                  <DropdownMenuItem onSelect={() => navigate('/profile')}>
                    <UserCircle2 className="h-4 w-4" />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-700" onSelect={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="odoo-subbar">
          <div className="odoo-subbar-inner justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-[#58a1ad]">
                <span>{formatRoleLabel(user?.role)}</span>
                <span className="text-ink-400">/</span>
                <span>{header.title}</span>
              </div>
              <h1 className="truncate text-[1.55rem] font-semibold tracking-[-0.035em] text-ink-950">
                {header.title}
              </h1>
            </div>

            <div className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              {formatRoleLabel(user?.role)}
            </div>
          </div>
        </div>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-4 lg:px-6">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-5">
        <header className="surface-card mb-5 px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="section-eyebrow">{formatRoleLabel(user?.role)}</p>
              <h1 className="mt-1 truncate text-[1.75rem] font-semibold tracking-[-0.04em] text-ink-950">
                {header.title}
              </h1>
              <p className="mt-1 text-sm leading-6 text-ink-600">{header.copy}</p>
            </div>

            <NotificationBell
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              triggerClassName="rounded-full"
              unreadCount={unreadCount}
            />
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
