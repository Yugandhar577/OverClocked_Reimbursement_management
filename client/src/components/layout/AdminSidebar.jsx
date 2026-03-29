import {
  BadgeIndianRupee,
  FileSpreadsheet,
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

const quickLinks = [
  { label: 'CSV Import', href: '/admin/import', icon: FileSpreadsheet },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
]

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-900 text-sm font-black uppercase tracking-[0.18em] text-white">
          {shellBrand.initials}
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold tracking-[-0.03em] text-ink-950">
            {shellBrand.name}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {shellBrand.subtitle}
          </p>
        </div>
      </div>

      <nav className="mt-4 space-y-1.5">
        {primaryNav.map((item) => {
          const Icon = iconMap[item.section] ?? WalletCards

          return (
            <NavLink
              key={item.href}
              className={({ isActive }) =>
                cn('admin-sidebar-link', isActive && 'admin-sidebar-link-active')
              }
              to={item.href}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-6 rounded-md border border-line bg-white px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
          Bulk Operations
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink-950">
          Import and audit
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-600">
          Keep settlements, reports, and transaction imports in the admin shell instead of the employee flow.
        </p>
      </div>

      <div className="mt-5 space-y-1.5 border-t border-line pt-4">
        {quickLinks.map(({ label, href, icon: Icon }) => (
          <NavLink key={href} className="admin-sidebar-link" to={href}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
