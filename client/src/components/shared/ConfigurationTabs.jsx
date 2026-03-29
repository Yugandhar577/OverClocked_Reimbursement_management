import { NavLink } from 'react-router-dom'
import { configurationTabs } from '../../data/adminData.js'
import { cn } from '../../utils/cn.js'

export function ConfigurationTabs() {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border border-line bg-white p-2 shadow-soft">
      {configurationTabs.map((tab) => (
        <NavLink
          key={tab.href}
          className={({ isActive }) =>
            cn(
              'rounded-md px-4 py-2 text-sm font-medium',
              isActive
                ? 'bg-brand-900 text-white'
                : 'text-ink-600',
            )
          }
          to={tab.href}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
