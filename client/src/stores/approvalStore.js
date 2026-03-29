import { create } from 'zustand'
import {
  approveExpenseRequest,
  listPendingApprovals,
  rejectExpenseRequest,
} from '../api/approval.api.js'
import { getExpenseDetail, listMobileExpenses } from '../api/expense.api.js'

export const useApprovalStore = create((set) => ({
  pendingItems: [],
  teamExpenses: [],
  pagination: null,
  isLoading: false,
  error: '',
  async loadPending(params = {}) {
    set({ isLoading: true, error: '' })

    try {
      const result = await listPendingApprovals(params)
      set({
        pendingItems: result.items,
        pagination: result.pagination,
        isLoading: false,
      })
      return result
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to load approvals.',
      })
      throw error
    }
  },
  async loadTeamExpenses(params = {}) {
    set({ isLoading: true, error: '' })

    try {
      const result = await listMobileExpenses(params)
      set({
        teamExpenses: result.items,
        isLoading: false,
      })
      return result
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to load team expenses.',
      })
      throw error
    }
  },
  async approve(expenseId, comment) {
    set({ isLoading: true, error: '' })

    try {
      await approveExpenseRequest(expenseId, comment)
      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        pendingItems: state.pendingItems.filter((item) => item.expense.id !== expenseId),
        teamExpenses: state.teamExpenses.map((item) => (item.id === expense.id ? expense : item)),
        isLoading: false,
      }))
      return expense
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to approve expense.',
      })
      throw error
    }
  },
  async reject(expenseId, comment) {
    set({ isLoading: true, error: '' })

    try {
      await rejectExpenseRequest(expenseId, comment)
      const expense = await getExpenseDetail(expenseId)
      set((state) => ({
        pendingItems: state.pendingItems.filter((item) => item.expense.id !== expenseId),
        teamExpenses: state.teamExpenses.map((item) => (item.id === expense.id ? expense : item)),
        isLoading: false,
      }))
      return expense
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message ?? error.message ?? 'Unable to reject expense.',
      })
      throw error
    }
  },
}))
