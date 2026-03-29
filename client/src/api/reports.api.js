import { reportsData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getExpenseReports() {
  return resolveMock(reportsData)
}
