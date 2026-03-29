import { HelpCircle, Search, Settings2 } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { topNav } from '../../data/adminData.js'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'
import { cn } from '../../utils/cn.js'
import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { NotificationBell } from '../admin/NotificationBell.jsx'

function getSection(pathname) {
  if (
    pathname.includes('/approval-rules') ||
    pathname.includes('/categories') ||
    pathname.includes('/import') ||
    pathname.includes('/hierarchy')
  ) {
    return 'configuration'
  }

  if (pathname.includes('/payments')) {
    return 'payments'
  }

  return pathname.split('/')[2] ?? 'dashboard'
}

export function AdminTopbar() {
  const location = useLocation()
  const profile = useAdminShellStore((state) => state.profile)
  const globalSearch = useAdminShellStore((state) => state.globalSearch)
  const setGlobalSearch = useAdminShellStore((state) => state.setGlobalSearch)
  const currentSection = getSection(location.pathname)

  return (
    <header className="surface-soft sticky top-4 z-20 flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
      <nav className="flex flex-wrap items-center gap-2">
        {topNav.map((item) => (
          <NavLink
            key={item.href}
            className={cn(
              'rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
              currentSection === item.section
                ? 'bg-white text-brand-900 shadow-soft'
                : 'text-ink-500 hover:bg-white/70 hover:text-brand-900',
            )}
            to={item.href}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative min-w-[16rem] flex-1 md:w-[21rem]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            className="border-white/80 bg-white/85 pl-10"
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search data..."
            value={globalSearch}
          />
        </div>
        <div className="flex items-center justify-end gap-2">
          <NotificationBell />
          <Button size="icon" variant="secondary">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
          <Button size="icon" variant="secondary">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
          <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/85 px-3 py-2 shadow-soft">
            <AvatarBadge initials={profile.initials} />
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-ink-950">{profile.name}</p>
              <p className="truncate text-xs uppercase tracking-[0.18em] text-ink-500">
                {profile.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
