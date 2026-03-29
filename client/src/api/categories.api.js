import { api } from './http.js'
import { getUsageTone, getWidthClass } from './transformers.js'

export async function listCategories(params = {}) {
  const response = await api.get('/api/categories', {
    params: {
      includeInactive: true,
      ...params,
    },
  })

  return response.data.data ?? []
}

export async function getCategoryWorkspace() {
  const categories = await listCategories()
  const rankedUsage = [...categories]
    .sort((left, right) => (right._count?.expenses ?? 0) - (left._count?.expenses ?? 0))
    .slice(0, 4)
  const maxUsage = Math.max(...rankedUsage.map((item) => item._count?.expenses ?? 0), 1)
  const liveUsage = rankedUsage.map((category, index) => ({
    label: category.name,
    share: `${Math.round(((category._count?.expenses ?? 0) / Math.max(categories.length, 1)) * 100)}%`,
    widthClass: getWidthClass(category._count?.expenses ?? 0, maxUsage),
    toneClass: getUsageTone(index),
  }))
  const liveCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    code: category.code,
    label: category.description ?? category.parent?.name ?? 'No description provided',
    status: category.isActive ? 'Active' : 'Review',
  }))

  return {
    summaryCount: categories.length,
    usage: liveUsage,
    categories: liveCategories,
  }
}
