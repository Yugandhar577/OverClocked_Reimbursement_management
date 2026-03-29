import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { getNotifications } from '../../api/notifications.api.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'
import { AdminSidebar } from './AdminSidebar.jsx'
import { AdminTopbar } from './AdminTopbar.jsx'

export function AdminLayout() {
  const status = useAuthStore((state) => state.status)
  const setNotifications = useAdminShellStore((state) => state.setNotifications)

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    let cancelled = false

    getNotifications({ limit: 6 })
      .then((result) => {
        if (!cancelled) {
          setNotifications(result.items, result.unreadCount)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotifications([], 0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [setNotifications, status])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f2f6_0%,#f4efee_32%,#f7f3f1_100%)] text-ink-950">
      <div className="mx-auto flex min-h-screen max-w-[1720px] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-5">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <AdminTopbar />
          <main className="pb-10 pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
