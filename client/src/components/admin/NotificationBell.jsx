import { Bell } from 'lucide-react'
import { notifications } from '../../data/adminData.js'
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
  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="relative rounded-2xl border border-white/70 bg-white/85 p-2.5 text-brand-800 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
              <span className="sr-only">Notifications</span>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Open activity feed</TooltipContent>
          <DropdownMenuContent align="end" className="w-80">
            {notifications.map((item) => (
              <DropdownMenuItem key={item.id} className="py-3">
                {item.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
    </TooltipProvider>
  )
}
