import { Focus, Search, ZoomIn, ZoomOut } from 'lucide-react'
import { AvatarBadge } from '../shared/AvatarBadge.jsx'
import { Card } from '../ui/card.jsx'
import { Button } from '../ui/button.jsx'

function PersonCard({ person, compact = false }) {
  return (
    <div className="rounded-md border border-line bg-white px-5 py-4 shadow-soft">
      <div className="flex items-center gap-3">
        <AvatarBadge
          className={compact ? 'h-10 w-10 rounded-xl' : undefined}
          initials={person.initials}
          toneClass={compact ? 'bg-brand-100 text-brand-900' : 'bg-brand-900 text-white'}
        />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink-950">{person.name}</p>
          <p className="truncate text-sm text-ink-600">{person.title}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
            {person.badge}
          </p>
        </div>
      </div>
    </div>
  )
}

export function OrgChart({ tree }) {
  return (
    <Card className="relative overflow-hidden px-6 py-8">
      <div className="pointer-events-none absolute inset-x-[16%] top-[7.8rem] hidden h-px bg-brand-100 xl:block" />
      <div className="pointer-events-none absolute left-1/2 top-[5.4rem] hidden h-12 w-px -translate-x-1/2 bg-brand-100 xl:block" />

      <div className="mx-auto max-w-md">
        <PersonCard person={tree.leader} />
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-3">
        {tree.branches.map((branch) => (
          <div key={branch.name} className="relative space-y-5">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden h-5 w-px -translate-x-1/2 bg-brand-100 xl:block" />
            <PersonCard person={branch} compact />
            {branch.children.map((child) => (
              <div key={child.name} className="pl-6">
                <div className="pointer-events-none absolute left-[3.25rem] top-[5.6rem] hidden h-6 w-px bg-brand-100 xl:block" />
                <PersonCard person={child} compact />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button size="icon" variant="secondary">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search chart</span>
        </Button>
        <Button size="icon" variant="secondary">
          <ZoomOut className="h-4 w-4" />
          <span className="sr-only">Zoom out</span>
        </Button>
        <Button size="icon" variant="secondary">
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom in</span>
        </Button>
        <Button size="icon" variant="secondary">
          <Focus className="h-4 w-4" />
          <span className="sr-only">Fit view</span>
        </Button>
      </div>
    </Card>
  )
}
