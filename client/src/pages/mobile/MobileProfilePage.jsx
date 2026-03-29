import { BellRing, Building2, LogOut, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/button.jsx'
import { getNotifications } from '../../api/notifications.api.js'
import { useAuthStore } from '../../stores/useAuthStore.js'

export function MobileProfilePage() {
  const company = useAuthStore((state) => state.company)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [notificationSummary, setNotificationSummary] = useState({ count: 0, unread: 0 })

  useEffect(() => {
    let cancelled = false

    getNotifications({ limit: 10 })
      .then((result) => {
        if (!cancelled) {
          setNotificationSummary({
            count: result.items.length,
            unread: result.unreadCount ?? 0,
          })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setNotificationSummary({ count: 0, unread: 0 })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-5">
      <section className="surface-card p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-900 text-xl font-black text-white shadow-float">
            {user?.firstName?.[0]}
          </div>
          <div>
            <p className="section-eyebrow">Profile</p>
            <h2 className="mt-1 font-display text-2xl font-black tracking-[-0.05em] text-ink-950">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="mt-2 text-sm text-ink-600">{user?.email}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <section className="surface-card flex items-center gap-4 p-4">
          <Building2 className="h-5 w-5 text-brand-700" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Company</p>
            <p className="mt-1 text-sm font-semibold text-ink-950">{company?.name ?? 'Unknown company'}</p>
          </div>
        </section>

        <section className="surface-card flex items-center gap-4 p-4">
          <ShieldCheck className="h-5 w-5 text-aqua-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Role</p>
            <p className="mt-1 text-sm font-semibold text-ink-950">{user?.role ?? 'Unknown role'}</p>
          </div>
        </section>

        <section className="surface-card flex items-center gap-4 p-4">
          <BellRing className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">Notifications</p>
            <p className="mt-1 text-sm font-semibold text-ink-950">
              {notificationSummary.unread} unread out of {notificationSummary.count}
            </p>
          </div>
        </section>
      </div>

      <Button className="w-full" onClick={logout} variant="danger">
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}
