import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestOnly, RequireAuth } from './components/auth/AuthGuard.jsx'
import { AdminLayout } from './components/layout/AdminLayout.jsx'
import { MobileLayout } from './components/layout/MobileLayout.jsx'
import { ApprovalRulesPage } from './pages/admin/ApprovalRulesPage.jsx'
import { CategoriesPage } from './pages/admin/CategoriesPage.jsx'
import { CsvImportPage } from './pages/admin/CsvImportPage.jsx'
import { CreateEmployeePage } from './pages/admin/CreateEmployeePage.jsx'
import { DashboardPage } from './pages/admin/DashboardPage.jsx'
import { EmployeeManagementPage } from './pages/admin/EmployeeManagementPage.jsx'
import { ExpensesPage } from './pages/admin/ExpensesPage.jsx'
import { HierarchyPage } from './pages/admin/HierarchyPage.jsx'
import { PaymentsPage } from './pages/admin/PaymentsPage.jsx'
import { ReportsPage } from './pages/admin/ReportsPage.jsx'
import { MyExpenses } from './pages/employee/MyExpenses.jsx'
import { NewExpense } from './pages/employee/NewExpense.jsx'
import { ExpenseDetail } from './pages/employee/ExpenseDetail.jsx'
import { ScanReceipt } from './pages/employee/ScanReceipt.jsx'
import { AuthPage } from './pages/auth/AuthPage.jsx'
import { ApprovalDetail } from './pages/manager/ApprovalDetail.jsx'
import { ApprovalQueue } from './pages/manager/ApprovalQueue.jsx'
import { TeamExpenses } from './pages/manager/TeamExpenses.jsx'
import { MobileProfilePage } from './pages/mobile/MobileProfilePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestOnly>
            <Navigate replace to="/login" />
          </GuestOnly>
        }
      />
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
          <RequireAuth roles={['SUPER_ADMIN', 'ADMIN', 'FINANCE']}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route
          path="employees/new"
          element={
            <RequireAuth roles={['SUPER_ADMIN', 'ADMIN']}>
              <CreateEmployeePage />
            </RequireAuth>
          }
        />
        <Route path="employees" element={<EmployeeManagementPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="hierarchy" element={<HierarchyPage />} />
        <Route
          path="approval-rules"
          element={
            <RequireAuth roles={['SUPER_ADMIN', 'ADMIN']}>
              <ApprovalRulesPage />
            </RequireAuth>
          }
        />
        <Route path="categories" element={<CategoriesPage />} />
        <Route
          path="import"
          element={
            <RequireAuth roles={['SUPER_ADMIN', 'ADMIN']}>
              <CsvImportPage />
            </RequireAuth>
          }
        />
        <Route path="payments" element={<PaymentsPage />} />
      </Route>
      <Route
        element={
          <RequireAuth roles={['EMPLOYEE', 'MANAGER', 'ADMIN', 'FINANCE', 'SUPER_ADMIN']}>
            <MobileLayout />
          </RequireAuth>
        }
      >
        <Route path="/expenses" element={<MyExpenses />} />
        <Route path="/expenses/new" element={<NewExpense />} />
        <Route path="/expenses/:id" element={<ExpenseDetail />} />
        <Route path="/scan" element={<ScanReceipt />} />
        <Route path="/profile" element={<MobileProfilePage />} />
      </Route>
      <Route
        element={
          <RequireAuth roles={['MANAGER', 'ADMIN', 'FINANCE', 'SUPER_ADMIN']}>
            <MobileLayout />
          </RequireAuth>
        }
      >
        <Route path="/approvals" element={<ApprovalQueue />} />
        <Route path="/approvals/:id" element={<ApprovalDetail />} />
        <Route path="/team-expenses" element={<TeamExpenses />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
