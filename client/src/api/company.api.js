import { csvImportData, hierarchyData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getHierarchyWorkspace() {
  return resolveMock(hierarchyData)
}

export function getCsvImportWorkspace() {
  return resolveMock(csvImportData)
}
