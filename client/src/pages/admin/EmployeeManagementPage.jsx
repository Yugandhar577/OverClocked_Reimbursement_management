import { ArrowRight, Upload, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createUser,
  getEmployeeDirectory,
  listDepartments,
  listUsers,
} from '../../api/users.api.js'
import { AvatarBadge } from '../../components/shared/AvatarBadge.jsx'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { DataTable } from '../../components/shared/DataTable.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button, buttonVariants } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

const roleVariant = {
  Admin: 'default',
  Manager: 'aqua',
  User: 'muted',
}

const initialCreateForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  departmentId: '',
  reportsToId: '',
}

export function EmployeeManagementPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [createError, setCreateError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departments, setDepartments] = useState([])
  const [managers, setManagers] = useState([])
  const [isLookupLoading, setIsLookupLoading] = useState(false)
  const { data, error, isLoading } = useMockResource(getEmployeeDirectory, [refreshKey])

  useEffect(() => {
    if (!isCreateOpen) {
      return
    }

    let cancelled = false
    setIsLookupLoading(true)

    Promise.all([
      listDepartments(),
      listUsers({ role: 'MANAGER', limit: 200 }),
    ])
      .then(([departmentItems, managerResult]) => {
        if (cancelled) {
          return
        }

        setDepartments(departmentItems)
        setManagers(managerResult.items)
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setDepartments([])
        setManagers([])
      })
      .finally(() => {
        if (!cancelled) {
          setIsLookupLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isCreateOpen])

  const updateCreateForm = (field, value) => {
    setCreateForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleCreateEmployee = async (event) => {
    event.preventDefault()

    setCreateError('')
    setIsSubmitting(true)

    const payload = {
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email.trim(),
      role: 'EMPLOYEE',
    }

    if (createForm.phone.trim()) {
      payload.phone = createForm.phone.trim()
    }

    if (createForm.departmentId) {
      payload.departmentId = createForm.departmentId
    }

    if (createForm.reportsToId) {
      payload.reportsToId = createForm.reportsToId
    }

    try {
      await createUser(payload)
      setRefreshKey((current) => current + 1)
      setCreateForm(initialCreateForm)
      setIsCreateOpen(false)
    } catch (nextError) {
      const fieldErrors = nextError?.response?.data?.errors
      const fieldMessage = Array.isArray(fieldErrors) && fieldErrors.length
        ? fieldErrors[0].message
        : ''

      setCreateError(
        fieldMessage ||
          nextError?.response?.data?.message ||
          nextError?.message ||
          'Unable to create employee.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingPanel />
  }

  if (!data) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {error?.response?.data?.message || error?.message || 'Unable to load employee directory.'}
      </div>
    )
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
  ]

  return (
    <PageTransition className="space-y-6">
      <Reveal>
        <PageHeader
          actions={
            <>
              <Button
                onClick={() => {
                  setCreateError('')
                  setIsCreateOpen(true)
                }}
                size="sm"
              >
                <UserPlus className="h-4 w-4" />
                Add Employee
              </Button>
              <Link className={buttonVariants({ size: 'sm', variant: 'secondary' })} to="/admin/import">
                <Upload className="h-4 w-4" />
                Open CSV tools
              </Link>
              <Link className={buttonVariants({ size: 'sm', variant: 'secondary' })} to="/admin/hierarchy">
                Review hierarchy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          }
          description="Manage enterprise access, reporting lines, and department-level visibility."
          title="Employee Directory"
        />
      </Reveal>

      <div className="grid gap-5 xl:grid-cols-4">
        {data.summary.map((item) => (
          <Reveal key={item.label}>
            <Card className="p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-ink-500">
                {item.label}
              </p>
              <p className="mt-4 text-[2.35rem] font-semibold tracking-[-0.05em] text-ink-950">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium text-ink-600">{item.note}</p>
            </Card>
          </Reveal>
        ))}

        <Reveal>
          <Card className="p-5">
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

      <Dialog
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            setCreateError('')
            setCreateForm(initialCreateForm)
          }
        }}
        open={isCreateOpen}
      >
        <DialogContent className="w-[min(92vw,42rem)] rounded-md border border-line p-6">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>
              Create a new employee account and send onboarding credentials by email.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateEmployee}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  First Name
                </label>
                <Input
                  onChange={(event) => updateCreateForm('firstName', event.target.value)}
                  required
                  value={createForm.firstName}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Last Name
                </label>
                <Input
                  onChange={(event) => updateCreateForm('lastName', event.target.value)}
                  required
                  value={createForm.lastName}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Email
                </label>
                <Input
                  onChange={(event) => updateCreateForm('email', event.target.value)}
                  required
                  type="email"
                  value={createForm.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Phone (Optional)
                </label>
                <Input
                  onChange={(event) => updateCreateForm('phone', event.target.value)}
                  value={createForm.phone}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Department
                </label>
                <select
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-950"
                  disabled={isLookupLoading}
                  onChange={(event) => updateCreateForm('departmentId', event.target.value)}
                  value={createForm.departmentId}
                >
                  <option value="">Unassigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
                  Reports To
                </label>
                <select
                  className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-950"
                  disabled={isLookupLoading}
                  onChange={(event) => updateCreateForm('reportsToId', event.target.value)}
                  value={createForm.reportsToId}
                >
                  <option value="">No manager assigned</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {`${manager.firstName} ${manager.lastName}`.trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {createError ? (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {createError}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                onClick={() => setIsCreateOpen(false)}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Creating...' : 'Create Employee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}
