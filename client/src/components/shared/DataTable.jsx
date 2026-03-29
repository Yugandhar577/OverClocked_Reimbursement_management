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
        'overflow-hidden rounded-md border border-line bg-white shadow-soft',
        className,
      )}
    >
      <table className="min-w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr className="bg-[#f6f7f9] text-[12px] uppercase tracking-[0.08em] text-ink-500">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 font-semibold first:rounded-tl-md last:rounded-tr-md',
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
                <td key={column.key} className={cn('px-4 py-4', column.cellClassName)}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {footer ? (
        <div className="flex items-center justify-between border-t border-line/70 px-4 py-3 text-xs uppercase tracking-[0.14em] text-ink-500">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
