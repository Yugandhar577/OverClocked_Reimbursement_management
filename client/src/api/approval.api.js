import { api, unwrap } from './http.js'

export async function listPendingApprovals(params = {}) {
  const response = await api.get('/api/approvals/pending', {
    params: {
      limit: 50,
      ...params,
    },
  })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
  }
}

export async function approveExpenseRequest(expenseId, comment) {
  const response = await api.post(`/api/approvals/${expenseId}/approve`, {
    comment,
  })

  return unwrap(response)
}

export async function rejectExpenseRequest(expenseId, comment) {
  const response = await api.post(`/api/approvals/${expenseId}/reject`, {
    comment,
  })

  return unwrap(response)
}
