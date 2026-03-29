import { ReceiptIndianRupee, ScanLine, UserCircle2, ClipboardCheck, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { cn } from '../../utils/cn.js'

const employeeItems = [
  { label: 'Expenses', to: '/expenses', icon: ReceiptIndianRupee },
  { label: 'Scan', to: '/scan', icon: ScanLine },
  { label: 'Profile', to: '/profile', icon: UserCircle2 },
]

const managerItems = [
  { label: 'Approvals', to: '/approvals', icon: ClipboardCheck },
  { label: 'Team', to: '/team-expenses', icon: Users },
  { label: 'Profile', to: '/profile', icon: UserCircle2 },
]

export function BottomNavBar() {
  const role = useAuthStore((state) => state.user?.role)
  const items = role === 'MANAGER' ? managerItems : employeeItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/95 px-4 py-3 shadow-[0_-18px_35px_-28px_rgba(49,14,43,0.4)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition',
                  isActive
                    ? 'bg-brand-900 text-white shadow-soft'
                    : 'text-ink-500 hover:bg-brand-50 hover:text-brand-900',
                )
              }
              to={item.to}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
