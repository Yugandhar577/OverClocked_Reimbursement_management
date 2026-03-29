import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Button } from '../ui/button.jsx'
import { cn } from '../../utils/cn.js'

export function SidebarFilters({
  action,
  sections,
  footerActionLabel = 'New Expense',
}) {
  return (
    <aside className="app-filters sticky top-24 flex h-fit w-full flex-col gap-6 lg:w-[18rem]">
      {action ? (
        <Button className="w-full justify-center gap-2" size="lg">
          {action}
        </Button>
      ) : null}
      {sections.map((section) => (
        <div key={section.label} className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {section.label}
          </p>
          {section.type === 'checkbox' ? (
            <div className="space-y-3">
              {section.items.map((item) => (
                <label
                  key={item.label}
                  className="flex items-center gap-3 text-sm text-ink-700"
                >
                  <input
                    checked={item.checked}
                    className="h-4 w-4 rounded border-line text-brand-700 accent-brand-700"
                    readOnly
                    type="checkbox"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          ) : null}
          {section.type === 'search-list' ? (
            <div className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left',
                    item.active ? 'bg-white shadow-soft' : 'bg-transparent',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <AvatarBadge
                      className="h-8 w-8 rounded-xl text-[10px]"
                      initials={item.initials}
                      toneClass={
                        item.active
                          ? 'bg-aqua-100 text-aqua-700'
                          : 'bg-brand-100 text-brand-700'
                      }
                    />
                    <span className={item.active ? 'font-semibold text-ink-950' : 'text-ink-700'}>
                      {item.label}
                    </span>
                  </div>
                  {item.count ? <span className="text-xs text-ink-500">{item.count}</span> : null}
                </div>
              ))}
            </div>
          ) : null}
          {section.type === 'pills' ? (
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-line bg-white px-3 py-1 text-xs font-medium text-ink-600"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
      {footerActionLabel ? (
        <div className="mt-auto border-t border-line/60 pt-4">
          <Button className="w-full" size="lg" variant="default">
            {footerActionLabel}
          </Button>
        </div>
      ) : null}
    </aside>
  )
}
