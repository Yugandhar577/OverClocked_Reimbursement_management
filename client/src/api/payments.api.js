import { paymentsData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getPaymentsQueue() {
  return resolveMock(paymentsData)
}
