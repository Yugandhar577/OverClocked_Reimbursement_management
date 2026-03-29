import { Bell } from 'lucide-react'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip.jsx'

export function NotificationBell() {
  const notifications = useAdminShellStore((state) => state.notifications)
  const unreadCount = useAdminShellStore((state) => state.unreadCount)

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="relative rounded-2xl border border-white/70 bg-white/85 p-2.5 text-brand-800 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
              <span className="sr-only">Notifications</span>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Open activity feed</TooltipContent>
          <DropdownMenuContent align="end" className="w-80">
            {notifications.length ? (
              notifications.map((item) => (
                <DropdownMenuItem key={item.id} className="py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="text-xs text-ink-500">{item.message ?? 'New system activity'}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="py-3 text-sm text-ink-500">
                No notifications yet
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  )
}
