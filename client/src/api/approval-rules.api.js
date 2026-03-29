import { approvalRulesData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getApprovalRulesWorkspace() {
  return resolveMock(approvalRulesData)
}
