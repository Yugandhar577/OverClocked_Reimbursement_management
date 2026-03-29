import { expensesData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getAllExpenses() {
  return resolveMock(expensesData)
}
