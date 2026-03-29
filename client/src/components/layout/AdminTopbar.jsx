import { LogOut, Settings2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { markAllNotificationsAsRead } from '../../api/notifications.api.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'
import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Button } from '../ui/button.jsx'
import { NotificationBell } from '../admin/NotificationBell.jsx'

function getSectionMeta(pathname) {
  if (pathname.includes('/approval-rules')) {
    return {
      eyebrow: 'Configuration',
      title: 'Approval Rules',
      copy: 'Tune approval sequencing, approvers, and policy thresholds.',
    }
  }

  if (pathname.includes('/categories')) {
    return {
      eyebrow: 'Configuration',
      title: 'Expense Categories',
      copy: 'Keep policy categories, labels, and reporting buckets aligned.',
    }
  }

  if (pathname.includes('/import')) {
    return {
      eyebrow: 'Configuration',
      title: 'CSV Operations',
      copy: 'Import and export expense records in bulk without leaving the admin shell.',
    }
  }

  if (pathname.includes('/hierarchy')) {
    return {
      eyebrow: 'Configuration',
      title: 'Organization Hierarchy',
      copy: 'Review reporting lines and leadership structure before routing approvals.',
    }
  }

  if (pathname.includes('/payments')) {
    return {
      eyebrow: 'Finance Operations',
      title: 'Reimbursement Settlements',
      copy: 'Track approved payouts and settlement readiness without payment-provider clutter.',
    }
  }

  if (pathname.includes('/employees')) {
    return {
      eyebrow: 'Admin Control',
      title: 'Employee Directory',
      copy: 'Review company roles, departments, and reporting ownership.',
    }
  }

  if (pathname.includes('/expenses')) {
    return {
      eyebrow: 'Admin Control',
      title: 'Expense Oversight',
      copy: 'Track submitted, approved, and paid expenses across the company.',
    }
  }

  if (pathname.includes('/reports')) {
    return {
      eyebrow: 'Admin Control',
      title: 'Expense Reports',
      copy: 'Monitor monthly report groupings, approval volume, and reimbursement status.',
    }
  }

  return {
    eyebrow: 'Admin Control',
    title: 'Executive Summary',
    copy: 'Review spend, approvals, and reimbursement activity from one clean control surface.',
  }
}

export function AdminTopbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const notifications = useAdminShellStore((state) => state.notifications)
  const unreadCount = useAdminShellStore((state) => state.unreadCount)
  const setNotifications = useAdminShellStore((state) => state.setNotifications)
  const section = getSectionMeta(location.pathname)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(
        notifications.map((item) => ({
          ...item,
          isRead: true,
        })),
        0,
      )
    } catch {
      setNotifications(notifications, unreadCount)
    }
  }

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-inner">
        <div className="min-w-0 space-y-1">
          <p className="section-eyebrow">{section.eyebrow}</p>
          <div className="space-y-1">
            <h1 className="truncate text-[1.65rem] font-semibold tracking-[-0.04em] text-ink-950">
              {section.title}
            </h1>
            <p className="truncate text-sm text-ink-500">{section.copy}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            unreadCount={unreadCount}
          />
          <Button
            onClick={() => navigate('/admin/approval-rules')}
            size="icon"
            variant="secondary"
          >
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Open configuration</span>
          </Button>
          <Button onClick={handleLogout} size="icon" variant="secondary">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </Button>
          <div className="flex items-center gap-3 rounded-md border border-line bg-[#fbfbfc] px-3 py-2">
            <AvatarBadge
              initials={user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : 'NA'}
            />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-ink-950">
                {user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin'}
              </p>
              <p className="truncate text-[11px] uppercase tracking-[0.12em] text-ink-500">
                {user?.role ? String(user.role).replaceAll('_', ' ') : 'Enterprise Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
