import { Search, UserPlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
import { useAuthStore } from '../../stores/useAuthStore.js'

const roleVariant = {
  Admin: 'default',
  Manager: 'aqua',
  User: 'muted',
}

export function EmployeeManagementPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useAuthStore((state) => state.user?.role)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { data, isLoading } = useMockResource(getEmployeeDirectory, [])

  useEffect(() => {
    const message = location.state?.createdUserMessage

    if (!message) {
      return
    }

    setSuccessMessage(message)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  if (isLoading || !data) {
    return <LoadingPanel />
  }

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return data.rows
    }

    return data.rows.filter((row) => {
      const searchable = [
        row.name,
        row.email,
        row.employeeId,
        row.position,
        row.department,
        row.role,
        row.reportsTo,
      ]

      return searchable.some((value) => String(value ?? '').toLowerCase().includes(query))
    })
  }, [data.rows, searchQuery])

  const totalRows = data.pagination?.total ?? data.rows.length
  const showingFrom = filteredRows.length ? 1 : 0
  const showingTo = filteredRows.length
  const canCreateEmployee = role === 'ADMIN' || role === 'SUPER_ADMIN'

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
    { key: 'position', header: 'Position' },
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
                <Input
                  className="pl-9"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Filter employees..."
                  value={searchQuery}
                />
              </div>
              {canCreateEmployee ? (
                <Button onClick={() => navigate('/admin/employees/new')}>
                  <UserPlus className="h-4 w-4" />
                  Create Employee
                </Button>
              ) : null}
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

      {successMessage ? (
        <Reveal>
          <div className="rounded-[22px] bg-aqua-50 px-4 py-3 text-sm text-aqua-700">
            {successMessage}
          </div>
        </Reveal>
      ) : null}

      <Reveal>
        <DataTable
          columns={columns}
          footer={
            <>
              <span>
                Showing {showingFrom.toLocaleString()} to {showingTo.toLocaleString()} of {totalRows.toLocaleString()} entries
              </span>
              <span>Filtered rows: {filteredRows.length.toLocaleString()}</span>
            </>
          }
          rows={filteredRows}
        />
      </Reveal>
    </PageTransition>
  )
}
