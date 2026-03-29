import { create } from 'zustand'
import { listCategories } from '../api/categories.api.js'
import { createExpenseComment } from '../api/comment.api.js'
import {
  addExpenseLine,
  createExpenseDraft,
  deleteExpenseDraft,
  deleteExpenseLine,
  getExpenseDetail,
  listMobileExpenses,
  listSupportedCurrencies,
  processExpenseReceipt,
  submitExpenseForApproval,
  updateExpenseDraft,
  updateExpenseLine,
  uploadExpenseReceipt,
} from '../api/expense.api.js'

export const useExpenseStore = create((set, get) => ({
  categories: [],
  currencies: [],
  expenses: [],
  pagination: null,
  currentExpense: null,
  duplicateWarnings: [],
  isLoading: false,
  isSaving: false,
  error: '',
  async bootstrapReferenceData() {
    try {
      const [categories, currencies] = await Promise.all([
        listCategories().catch(() => []),
        listSupportedCurrencies().catch(() => []),
      ])

      set({ categories, currencies })
      return { categories, currencies }
    } catch (error) {
      set({ error: error.message ?? 'Unable to load mobile reference data.' })
      return { categories: [], currencies: [] }
    }
  },
  async loadExpenses(params = {}) {
    set({ isLoading: true, error: '' })

    try {
      const result = await listMobileExpenses(params)
      set({
        expenses: result.items,
        pagination: result.pagination,
        isLoading: false,
      })
      return result
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to load expenses.',
      })
      throw error
    }
  },
  async loadExpense(expenseId) {
    set({ isLoading: true, error: '' })

    try {
      const expense = await getExpenseDetail(expenseId)
      set({ currentExpense: expense, isLoading: false })
      return expense
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to load expense detail.',
      })
      throw error
    }
  },
  async createDraft(payload) {
    set({ isSaving: true, error: '' })

    try {
      const expense = await createExpenseDraft(payload)
      set((state) => ({
        currentExpense: expense,
        expenses: [expense, ...state.expenses.filter((item) => item.id !== expense.id)],
        isSaving: false,
      }))
      return expense
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to create expense draft.',
      })
      throw error
    }
  },
  async updateDraft(expenseId, payload) {
    set({ isSaving: true, error: '' })

    try {
      const expense = await updateExpenseDraft(expenseId, payload)
      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        isSaving: false,
      }))
      return expense
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to save expense draft.',
      })
      throw error
    }
  },
  async removeDraft(expenseId) {
    set({ isSaving: true, error: '' })

    try {
      await deleteExpenseDraft(expenseId)
      set((state) => ({
        currentExpense: state.currentExpense?.id === expenseId ? null : state.currentExpense,
        expenses: state.expenses.filter((item) => item.id !== expenseId),
        isSaving: false,
      }))
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to delete the draft.',
      })
      throw error
    }
  },
  async saveLine(expenseId, lineId, payload) {
    set({ isSaving: true, error: '' })

    try {
      if (lineId) {
        await updateExpenseLine(expenseId, lineId, payload)
      } else {
        await addExpenseLine(expenseId, payload)
      }

      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        isSaving: false,
      }))
      return expense
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to save expense line.',
      })
      throw error
    }
  },
  async removeLine(expenseId, lineId) {
    set({ isSaving: true, error: '' })

    try {
      await deleteExpenseLine(expenseId, lineId)
      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        isSaving: false,
      }))
      return expense
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to delete expense line.',
      })
      throw error
    }
  },
  async uploadAndProcessReceipt(expenseId, file, expenseLineId) {
    set({ isSaving: true, error: '' })

    try {
      const receipt = await uploadExpenseReceipt(expenseId, file, expenseLineId)
      const ocr = await processExpenseReceipt(receipt.id)
      const expense = await getExpenseDetail(expenseId)

      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        isSaving: false,
      }))

      return { receipt, ocr, expense }
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to process receipt OCR.',
      })
      throw error
    }
  },
  async submitExpense(expenseId) {
    set({ isSaving: true, error: '', duplicateWarnings: [] })

    try {
      const result = await submitExpenseForApproval(expenseId)
      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        duplicateWarnings: result.duplicateWarnings,
        isSaving: false,
      }))
      return { expense, duplicateWarnings: result.duplicateWarnings }
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to submit expense.',
      })
      throw error
    }
  },
  async addComment(expenseId, payload) {
    set({ isSaving: true, error: '' })

    try {
      await createExpenseComment(expenseId, payload)
      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        currentExpense: expense,
        expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)),
        isSaving: false,
      }))
      return expense
    } catch (error) {
      set({
        isSaving: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to post comment.',
      })
      throw error
    }
  },
  clearCurrentExpense() {
    set({ currentExpense: null, duplicateWarnings: [], error: '' })
  },
  getCategoryOptions() {
    return get().categories.map((category) => ({
      label: category.name,
      value: category.id,
    }))
  },
}))
