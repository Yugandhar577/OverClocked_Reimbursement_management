import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout.jsx'
import { ApprovalRulesPage } from './pages/admin/ApprovalRulesPage.jsx'
import { CategoriesPage } from './pages/admin/CategoriesPage.jsx'
import { CsvImportPage } from './pages/admin/CsvImportPage.jsx'
import { DashboardPage } from './pages/admin/DashboardPage.jsx'
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage.jsx'
import { ExpensesPage } from './pages/admin/ExpensesPage.jsx'
import { HierarchyPage } from './pages/admin/HierarchyPage.jsx'
import { PaymentsPage } from './pages/admin/PaymentsPage.jsx'
import { ReportsPage } from './pages/admin/ReportsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/admin/dashboard" />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeeManagementPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="hierarchy" element={<HierarchyPage />} />
        <Route path="approval-rules" element={<ApprovalRulesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="import" element={<CsvImportPage />} />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/admin/dashboard" />} />
    </Routes>
  )
}
