import { api, unwrap } from './http.js'

export async function listExpenseComments(expenseId) {
  const response = await api.get(`/api/comments/expense/${expenseId}`)
  return response.data.data ?? { expenseId, comments: [] }
}

export async function createExpenseComment(expenseId, payload) {
  const response = await api.post(`/api/comments/expense/${expenseId}`, payload)
  return unwrap(response)
}
