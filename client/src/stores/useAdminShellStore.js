import { create } from 'zustand'

export const useAdminShellStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications, unreadCount = notifications.length) =>
    set({ notifications, unreadCount }),
  isCategoryDialogOpen: false,
  openCategoryDialog: () => set({ isCategoryDialogOpen: true }),
  closeCategoryDialog: () => set({ isCategoryDialogOpen: false }),
}))
