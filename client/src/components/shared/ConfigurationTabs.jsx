import { NavLink } from 'react-router-dom'
import { configurationTabs } from '../../data/adminData.js'
import { cn } from '../../utils/cn.js'

export function ConfigurationTabs() {
  return (
    <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/70 bg-white/70 p-2 shadow-soft backdrop-blur">
      {configurationTabs.map((tab) => (
        <NavLink
          key={tab.href}
          className={({ isActive }) =>
            cn(
              'rounded-2xl px-4 py-2 text-sm font-semibold transition',
              isActive
                ? 'bg-brand-800 text-white shadow-soft'
                : 'text-ink-600 hover:bg-brand-50 hover:text-brand-900',
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
