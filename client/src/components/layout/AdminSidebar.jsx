import {
  BadgeIndianRupee,
  CircleHelp,
  FileText,
  LayoutDashboard,
  ReceiptText,
  Settings2,
  Users2,
  WalletCards,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { primaryNav, shellBrand } from '../../data/adminData.js'
import { cn } from '../../utils/cn.js'

const iconMap = {
  dashboard: LayoutDashboard,
  employees: Users2,
  expenses: ReceiptText,
  reports: FileText,
  payments: BadgeIndianRupee,
  configuration: Settings2,
}

const utilityLinks = [
  { label: 'Support', icon: CircleHelp },
  { label: 'Documentation', icon: FileText },
]

export function AdminSidebar() {
  return (
    <aside className="surface-soft flex w-full flex-col gap-8 px-5 py-6 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[17rem] lg:flex-none">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-900 text-lg font-black uppercase tracking-[0.18em] text-white shadow-soft">
          {shellBrand.initials}
        </div>
        <div className="space-y-1">
          <p className="font-display text-lg font-black tracking-[-0.04em] text-ink-950">
            {shellBrand.name}
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-ink-500">
            {shellBrand.subtitle}
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {primaryNav.map((item) => {
          const Icon = iconMap[item.section] ?? WalletCards

          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-brand-100/90 text-brand-950 shadow-soft ring-1 ring-brand-200'
                    : 'text-ink-600 hover:bg-white/80 hover:text-brand-900',
                )
              }
              to={item.href}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="rounded-[28px] bg-gradient-to-br from-brand-800 to-brand-700 p-5 text-white shadow-float">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
          Treasury Ops
        </p>
        <p className="mt-3 font-display text-2xl font-black tracking-[-0.05em]">
          Instant settlement
        </p>
        <p className="mt-2 text-sm leading-6 text-white/78">
          Monitor enterprise reimbursements with approval-aware payout queues.
        </p>
      </div>

      <div className="mt-auto space-y-2 border-t border-line/70 pt-6">
        {utilityLinks.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-white/80 hover:text-brand-900"
            type="button"
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
