import { api } from './http.js'
import {
  formatCompactCount,
  getInitials,
  toUiRole,
} from './transformers.js'

export async function listUsers(params = {}) {
  const response = await api.get('/api/users', {
    params: {
      limit: 100,
      ...params,
    },
  })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
  }
}

export async function createUser(payload) {
  const response = await api.post('/api/users', payload)
  return response.data.data
}

export async function listDepartments() {
  const response = await api.get('/api/departments')
  return response.data.data ?? []
}

function getFilenameFromDisposition(contentDisposition, fallback) {
  const match = /filename="?([^";]+)"?/i.exec(contentDisposition ?? '')
  return match?.[1] ?? fallback
}

export async function downloadUserImportTemplate() {
  const response = await api.get('/api/users/import-template', {
    responseType: 'blob',
  })

  return {
    blob: response.data,
    filename: getFilenameFromDisposition(
      response.headers['content-disposition'],
      'user_import_template.csv',
    ),
  }
}

export async function importUsersCsv(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/users/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return {
    result: response.data.data ?? { success: 0, failed: 0, errors: [] },
    message: response.data.message ?? 'Import completed.',
  }
}

export async function previewUsersImport(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/users/import/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data.data
}

export async function finalizeUsersImport(rows) {
  const response = await api.post('/api/users/import/finalize', { rows })

  return {
    result: response.data.data ?? { success: 0, failed: 0, errors: [], createdUsers: [] },
    message: response.data.message ?? 'Import finalized.',
  }
}

export async function getEmployeeDirectory() {
  const { items, pagination } = await listUsers()
  const total = pagination?.total ?? items.length
  const activeUsers = items.filter((user) => user.status === 'ACTIVE')
  const departmentNames = [
    ...new Set(items.map((user) => user.department?.name).filter(Boolean)),
  ]
  const pendingSyncs = items.filter((user) => user.status !== 'ACTIVE').length

  const roleBuckets = {
    Admin: items.filter((user) => toUiRole(user.role) === 'Admin').length,
    Manager: items.filter((user) => toUiRole(user.role) === 'Manager').length,
    User: items.filter((user) => toUiRole(user.role) === 'User').length,
  }

  const roleMix = Object.entries(roleBuckets).map(([label, count], index) => ({
    label,
    shareClass:
      count === 0
        ? 'w-[10%]'
        : index === 0
          ? 'w-[22%]'
          : index === 1
            ? 'w-[28%]'
            : 'w-[50%]',
    dot: index === 0 ? 'bg-brand-700' : index === 1 ? 'bg-aqua-600' : 'bg-ink-400',
  }))

  return {
    summary: [
      {
        label: 'Total Staff',
        value: formatCompactCount(total),
        note: `${formatCompactCount(activeUsers.length)} active in directory`,
        tone: 'aqua',
      },
      {
        label: 'Departments',
        value: formatCompactCount(departmentNames.length),
        note: 'Live company structure',
        tone: 'brand',
      },
      {
        label: 'Pending Syncs',
        value: String(pendingSyncs).padStart(2, '0'),
        note: pendingSyncs ? 'Accounts still need activation' : 'All accounts are active',
        tone: pendingSyncs ? 'amber' : 'aqua',
      },
    ],
    roleMix,
    rows: items.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      employeeId: user.employeeCode ?? `EMP-${user.id.slice(-6).toUpperCase()}`,
      position: user.position ?? 'Unassigned',
      department: user.department?.name ?? 'Unassigned',
      role: toUiRole(user.role),
      reportsTo: user.reportsTo
        ? `${user.reportsTo.firstName} ${user.reportsTo.lastName}`
        : '-',
      initials: getInitials(user.firstName, user.lastName),
    })),
    pagination,
  }
}
