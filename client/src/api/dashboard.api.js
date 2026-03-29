import { dashboardData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getDashboardSummary() {
  return resolveMock(dashboardData)
}
