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
    title: node.position ?? node.email,
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

  return {
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
}

export async function getCsvImportWorkspace() {
  const response = await api.get('/api/companies/stats')
  const stats = response.data.data
  const totalRows = Number(stats.users ?? 0) + Number(stats.departments ?? 0) + Number(stats.categories ?? 0)

  return {
    manifest: 'employee-import.xlsx',
    totalRows: formatCompactCount(totalRows),
    readyRows: formatCompactCount(Math.max(totalRows - 1, 0)),
    criticalError: 'Upload an XLSX or CSV employee manifest to preview hierarchy before creating accounts.',
    mappings: [
      { field: 'Full Name', mappedTo: 'fullName', status: 'mapped' },
      { field: 'Email', mappedTo: 'email', status: 'mapped' },
      { field: 'Reports To', mappedTo: 'reportsTo', status: 'mapped' },
    ],
    previewRows: [
      { date: 'Awaiting file', merchant: 'Upload required', amount: '-', status: 'Pending' },
    ],
    tips: [
      'The preview step extracts roles, positions, and reporting candidates before any accounts are created.',
      'Finalize the import only after each employee has a valid manager assignment.',
    ],
  }
}
