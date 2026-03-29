import { Search, UserPlus } from 'lucide-react'
import { getEmployeeDirectory } from '../../api/users.api.js'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { DataTable, RowActions } from '../../components/shared/DataTable.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

const roleVariant = {
  Admin: 'default',
  Manager: 'aqua',
  User: 'muted',
}

export function EmployeeManagementPage() {
  const { data, isLoading } = useMockResource(getEmployeeDirectory, [])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-4">
          <AvatarBadge initials={row.initials} />
          <div className="min-w-0">
            <p className="font-semibold text-ink-950">{row.name}</p>
            <p className="truncate text-sm text-ink-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'employeeId', header: 'Employee ID' },
    { key: 'department', header: 'Department' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge variant={roleVariant[row.role]}>{row.role}</Badge>,
    },
    { key: 'reportsTo', header: 'Reports To' },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: () => <RowActions />,
    },
  ]

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <PageHeader
          actions={
            <>
              <div className="relative min-w-[18rem]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input className="pl-9" placeholder="Filter employees..." />
              </div>
              <Button>
                <UserPlus className="h-4 w-4" />
                Create Employee
              </Button>
            </>
          }
          description="Manage enterprise access, reporting lines, and department-level visibility."
          title="Employee Directory"
        />
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-4">
        {data.summary.map((item) => (
          <Reveal key={item.label}>
            <Card className="p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-500">
                {item.label}
              </p>
              <p className="mt-4 font-display text-[3rem] font-black tracking-[-0.06em] text-ink-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium text-ink-600">{item.note}</p>
            </Card>
          </Reveal>
        ))}

        <Reveal>
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Role Mix</CardTitle>
              <CardDescription>Permission spread across active staff.</CardDescription>
            </CardHeader>
            <div className="mt-7 h-3 overflow-hidden rounded-full bg-[#ece6e7]">
              {data.roleMix.map((item) => (
                <div
                  key={item.label}
                  className={`${item.shareClass} ${item.dot} h-3 first:rounded-l-full last:rounded-r-full inline-block`}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-4">
              {data.roleMix.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="font-medium text-ink-700">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <DataTable
          columns={columns}
          footer={
            <>
              <span>Showing 1 to 4 of 1,284 entries</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost">
                  <span className="text-xs">1</span>
                </Button>
                <Button size="icon" variant="ghost">
                  <span className="text-xs">2</span>
                </Button>
                <Button size="icon" variant="ghost">
                  <span className="text-xs">3</span>
                </Button>
              </div>
            </>
          }
          rows={data.rows}
        />
      </Reveal>
    </PageTransition>
  )
}
