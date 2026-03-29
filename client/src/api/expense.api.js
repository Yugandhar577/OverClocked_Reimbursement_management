import { api, unwrap } from './http.js'

export async function listMobileExpenses(params = {}) {
  const response = await api.get('/api/expenses', {
    params: {
      limit: 100,
      sortBy: 'expenseDate',
      sortOrder: 'desc',
      ...params,
    },
  })

  return {
    items: response.data.data ?? [],
    pagination: response.data.pagination ?? null,
  }
}

export async function getExpenseDetail(expenseId) {
  const response = await api.get(`/api/expenses/${expenseId}`)
  return unwrap(response)
}

export async function createExpenseDraft(payload) {
  const response = await api.post('/api/expenses', payload)
  return unwrap(response)
}

export async function updateExpenseDraft(expenseId, payload) {
  const response = await api.put(`/api/expenses/${expenseId}`, payload)
  return unwrap(response)
}

export async function deleteExpenseDraft(expenseId) {
  await api.delete(`/api/expenses/${expenseId}`)
}

export async function submitExpenseForApproval(expenseId) {
  const response = await api.post(`/api/expenses/${expenseId}/submit`)
  return {
    expense: response.data.data,
    duplicateWarnings: response.data.duplicateWarnings ?? [],
  }
}

export async function addExpenseLine(expenseId, payload) {
  const response = await api.post(`/api/expenses/${expenseId}/lines`, payload)
  return unwrap(response)
}

export async function updateExpenseLine(expenseId, lineId, payload) {
  const response = await api.put(`/api/expenses/${expenseId}/lines/${lineId}`, payload)
  return unwrap(response)
}

export async function deleteExpenseLine(expenseId, lineId) {
  await api.delete(`/api/expenses/${expenseId}/lines/${lineId}`)
}

export async function uploadExpenseReceipt(expenseId, file, expenseLineId) {
  const formData = new FormData()
  formData.append('file', file)

  if (expenseLineId) {
    formData.append('expenseLineId', expenseLineId)
  }

  const response = await api.post(`/api/receipts/expense/${expenseId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrap(response)
}

export async function processExpenseReceipt(receiptId) {
  const response = await api.post(`/api/receipts/${receiptId}/ocr`)
  return unwrap(response)
}

export async function getReceiptAssetUrl(receiptId) {
  const response = await api.get(`/api/receipts/${receiptId}/url`)
  return response.data.data?.url ?? null
}

export async function listSupportedCurrencies() {
  const response = await api.get('/api/companies/currencies')
  return response.data.data ?? []
}
