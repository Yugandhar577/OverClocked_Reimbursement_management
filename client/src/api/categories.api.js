import { categoriesData } from '../data/adminData.js'
import { resolveMock } from './mock.api.js'

export function getCategoryWorkspace() {
  return resolveMock(categoriesData)
}
