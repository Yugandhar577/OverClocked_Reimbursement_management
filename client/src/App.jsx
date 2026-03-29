import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from './components/auth/AuthGuard.jsx'
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
import { AuthPage } from './pages/auth/AuthPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/admin/dashboard" />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <AuthPage mode="login" />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <AuthPage mode="signup" />
          </GuestOnly>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
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
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
