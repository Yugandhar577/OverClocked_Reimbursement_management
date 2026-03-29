import { api } from './http.js'
import { listUsers } from './users.api.js'
import { formatCompactCount, getInitials, humanizeEnum } from './transformers.js'

function flattenUsers(nodes, bucket = []) {
  nodes.forEach((node) => {
    bucket.push(node)
    flattenUsers(node.children ?? [], bucket)
  })
  return bucket
}

function mapPerson(node) {
  if (!node) {
    return {
      name: 'No Leader Assigned',
      title: 'Create users to build the reporting tree',
      badge: 'Pending',
      initials: 'NA',
    }
  }

  return {
    name: `${node.firstName} ${node.lastName}`.trim(),
    title: node.email,
    badge: humanizeEnum(node.role),
    initials: getInitials(node.firstName, node.lastName),
  }
}

export async function getHierarchyWorkspace() {
  const [hierarchyResponse, { items: users }] = await Promise.all([
    api.get('/api/users/hierarchy'),
    listUsers(),
  ])

  const treeRoots = hierarchyResponse.data.data ?? []
  const flatUsers = flattenUsers(treeRoots)
  const leader = treeRoots[0] ?? null
  const branches = leader?.children?.length
    ? leader.children
    : treeRoots.slice(1)

  const departmentCounts = new Map()
  users.forEach((user) => {
    const label = user.department?.name ?? 'Unassigned'
    departmentCounts.set(label, (departmentCounts.get(label) ?? 0) + 1)
  })

  const workspace = {
    departments: Array.from(departmentCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, count], index) => ({
        label,
        count,
        checked: index < 3,
      })),
    levels: ['Executive', 'Finance', 'Operations', 'Technology'],
    tree: {
      leader: mapPerson(leader),
      branches:
        branches?.slice(0, 3).map((branch) => ({
          ...mapPerson(branch),
          children: (branch.children ?? []).slice(0, 2).map(mapPerson),
        })) ?? [],
    },
    flatCount: formatCompactCount(flatUsers.length),
  }

  return workspace
}

export async function getCsvImportWorkspace() {
  const response = await api.get('/api/companies/stats')
  const stats = response.data.data
  const hasUsers = Number(stats.users ?? 0) > 0

  return {
    manifest: 'No file selected',
    totalRows: '0',
    readyRows: '0',
    criticalError: hasUsers
      ? 'Select a CSV file to validate field mappings before importing.'
      : 'Create employee accounts first, then upload a CSV for validation.',
    mappings: [
      { field: 'Employee', mappedTo: 'Not mapped', status: 'pending' },
      { field: 'Title', mappedTo: 'Not mapped', status: 'pending' },
      { field: 'Amount', mappedTo: 'Not mapped', status: 'pending' },
      { field: 'Expense Date', mappedTo: 'Not mapped', status: 'pending' },
    ],
    previewRows: [],
    missingFields: ['Employee', 'Title', 'Amount', 'Expense Date'],
    tips: [
      'Use the import template to keep headers aligned with backend validation.',
      'Ensure employee emails already exist in the directory before import.',
      'Validate mappings before importing to avoid partial failures.',
    ],
  }
}
