import { employeeManagementData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getEmployeeDirectory() {
  return resolveMock(employeeManagementData)
}
