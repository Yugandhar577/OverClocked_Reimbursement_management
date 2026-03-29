import { ArrowLeft, LoaderCircle, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { humanizeEnum } from '../../api/transformers.js'
import { createUser, listDepartments, listUsers } from '../../api/users.api.js'
import { LoadingPanel } from '../../components/shared/LoadingPanel.jsx'
import { PageHeader } from '../../components/shared/PageHeader.jsx'
import { PageTransition, Reveal } from '../../components/shared/PageTransition.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useMockResource } from '../../hooks/useMockResource.js'

const roleOptions = [
  { label: 'Employee', value: 'EMPLOYEE' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Finance', value: 'FINANCE' },
  { label: 'Admin', value: 'ADMIN' },
]

const managerRoles = new Set(['MANAGER', 'FINANCE', 'ADMIN', 'SUPER_ADMIN'])

const initialFormState = {
  firstName: '',
  lastName: '',
  email: '',
  employeeCode: '',
  position: '',
  role: 'EMPLOYEE',
  departmentId: '',
  reportsToId: '',
  phone: '',
}

function toNullable(value) {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    'Unable to create employee right now. Please try again.'
  )
}

export function CreateEmployeePage() {
  const navigate = useNavigate()
  const [formState, setFormState] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    data,
    isLoading,
    error: loadError,
  } = useMockResource(async () => {
    const [departments, { items: users }] = await Promise.all([
      listDepartments(),
      listUsers({ limit: 500 }),
    ])

    return {
      departments,
      users,
    }
  }, [])

  const managerOptions = useMemo(
    () => (data?.users ?? []).filter((user) => managerRoles.has(user.role)),
    [data?.users],
  )

  const handleFieldChange = (field, value) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formState.firstName.trim() || !formState.lastName.trim() || !formState.email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        email: formState.email.trim().toLowerCase(),
        employeeCode: toNullable(formState.employeeCode),
        position: toNullable(formState.position),
        role: formState.role,
        departmentId: formState.departmentId || null,
        reportsToId: formState.reportsToId || null,
        phone: toNullable(formState.phone),
      }

      await createUser(payload)

      navigate('/admin/employees', {
        replace: true,
        state: {
          createdUserMessage: `${payload.firstName} ${payload.lastName} was added successfully.`,
        },
      })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <LoadingPanel />
  }

  if (!data) {
    return (
      <PageTransition>
        <Card className="p-6">
          <p className="text-sm text-red-700">
            {getErrorMessage(loadError)}
          </p>
        </Card>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="space-y-8">
      <Reveal>
        <PageHeader
          actions={
            <Button onClick={() => navigate('/admin/employees')} size="sm" variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Directory
            </Button>
          }
          description="Create employees, managers, and finance users with reporting relationships for approval routing."
          eyebrow="Employee Setup"
          title="Create Employee"
        />
      </Reveal>

      <Reveal>
        <Card className="p-7">
          {error ? (
            <div className="mb-5 rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  First Name
                </label>
                <Input
                  onChange={(event) => handleFieldChange('firstName', event.target.value)}
                  placeholder="Priya"
                  value={formState.firstName}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Last Name
                </label>
                <Input
                  onChange={(event) => handleFieldChange('lastName', event.target.value)}
                  placeholder="Sharma"
                  value={formState.lastName}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Work Email
                </label>
                <Input
                  onChange={(event) => handleFieldChange('email', event.target.value)}
                  placeholder="priya.sharma@apex.com"
                  type="email"
                  value={formState.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Employee Code
                </label>
                <Input
                  onChange={(event) => handleFieldChange('employeeCode', event.target.value)}
                  placeholder="EMP-1004"
                  value={formState.employeeCode}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Position
                </label>
                <Input
                  onChange={(event) => handleFieldChange('position', event.target.value)}
                  placeholder="Account Executive"
                  value={formState.position}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Phone
                </label>
                <Input
                  onChange={(event) => handleFieldChange('phone', event.target.value)}
                  placeholder="+91 99999 99999"
                  value={formState.phone}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Platform Role
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 shadow-soft outline-none"
                  onChange={(event) => handleFieldChange('role', event.target.value)}
                  value={formState.role}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Department
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 shadow-soft outline-none"
                  onChange={(event) => handleFieldChange('departmentId', event.target.value)}
                  value={formState.departmentId}
                >
                  <option value="">Unassigned</option>
                  {data.departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                  Reports To
                </label>
                <select
                  className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 shadow-soft outline-none"
                  onChange={(event) => handleFieldChange('reportsToId', event.target.value)}
                  value={formState.reportsToId}
                >
                  <option value="">No manager</option>
                  {managerOptions.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName} ({humanizeEnum(manager.role)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-[22px] bg-brand-50 px-4 py-3 text-sm text-ink-700">
              A temporary password is generated automatically and sent in the welcome email.
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                onClick={() => navigate('/admin/employees')}
                type="button"
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Create Employee
              </Button>
            </div>
          </form>
        </Card>
      </Reveal>
    </PageTransition>
  )
}
