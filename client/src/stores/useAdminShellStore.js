import { create } from 'zustand'
import { notifications, shellProfile } from '../data/adminData.js'

export const useAdminShellStore = create((set) => ({
  globalSearch: '',
  setGlobalSearch: (value) => set({ globalSearch: value }),
  activeRange: 'last-30-days',
  setActiveRange: (value) => set({ activeRange: value }),
  notifications,
  profile: shellProfile,
  isCategoryDialogOpen: false,
  openCategoryDialog: () => set({ isCategoryDialogOpen: true }),
  closeCategoryDialog: () => set({ isCategoryDialogOpen: false }),
}))
