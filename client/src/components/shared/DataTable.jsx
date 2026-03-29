import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx'
import { Button } from '../ui/button.jsx'
import { cn } from '../../utils/cn.js'

export function DataTable({
  columns,
  rows,
  footer,
  className,
  rowClassName,
  compact = false,
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[28px] border border-line bg-white shadow-card',
        className,
      )}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-[#f1ecea] text-[11px] uppercase tracking-[0.24em] text-ink-500">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-6 py-4 font-semibold first:rounded-tl-[28px] last:rounded-tr-[28px]',
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              className={cn(
                'border-b border-line/70 text-sm text-ink-700 last:border-b-0',
                compact ? 'align-top' : 'align-middle',
                rowClassName,
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className={cn('px-6 py-5', column.cellClassName)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer ? (
        <div className="flex items-center justify-between border-t border-line/70 px-6 py-4 text-xs uppercase tracking-[0.2em] text-ink-500">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

export function RowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Open details</DropdownMenuItem>
        <DropdownMenuItem>Assign reviewer</DropdownMenuItem>
        <DropdownMenuItem>Export row</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
