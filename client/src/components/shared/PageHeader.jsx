import { cn } from '../../utils/cn.js'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="section-title">{title}</h1>
          {description ? <p className="section-copy">{description}</p> : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </div>
  )
}
