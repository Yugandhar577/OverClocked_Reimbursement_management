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
          setNotifications(
            result.items ?? [],
            result.unreadCount ?? result.items?.length ?? 0,
          )
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
    <div className="admin-layout">
      <div className="admin-frame flex-col lg:flex-row">
        <AdminSidebar />
        <div className="admin-content">
          <AdminTopbar />
          <main className="admin-page">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
