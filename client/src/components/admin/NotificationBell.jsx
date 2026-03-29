import { Bell, CheckCheck } from 'lucide-react'
import { useAdminShellStore } from '../../stores/useAdminShellStore.js'
import { Button } from '../ui/button.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx'
import { cn } from '../../utils/cn.js'

export function NotificationBell({
  notifications: externalNotifications,
  unreadCount: externalUnreadCount,
  onMarkAllRead,
  triggerClassName,
}) {
  const storeNotifications = useAdminShellStore((state) => state.notifications)
  const storeUnreadCount = useAdminShellStore((state) => state.unreadCount)
  const notifications = externalNotifications ?? storeNotifications
  const unreadCount = externalUnreadCount ?? storeUnreadCount

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'relative rounded-md border border-line bg-white p-2 text-brand-800 shadow-soft',
          triggerClassName,
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e64d5e] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
        <span className="sr-only">Notifications</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] rounded-md border-line p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ink-950">Notifications</p>
            <p className="text-xs text-ink-500">
              {unreadCount ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {onMarkAllRead && unreadCount ? (
            <Button className="h-8 px-3" onClick={onMarkAllRead} size="sm" variant="ghost">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : null}
        </div>

        <div className="max-h-[22rem] overflow-y-auto p-2">
          {notifications.length ? (
            notifications.map((item) => (
              <DropdownMenuItem
                key={item.id}
                className={cn(
                  'flex-col items-start gap-1 rounded-md px-3 py-3',
                  !item.isRead && 'bg-[#f8f6f9]',
                )}
              >
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="line-clamp-2 text-xs leading-5 text-ink-500">
                  {item.message ?? 'New system activity'}
                </p>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="px-3 py-6 text-sm text-ink-500">No notifications yet.</div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
