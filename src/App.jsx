import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import AdopterHomePage from '@/pages/adopter/AdopterHomePage'
import ShelterHomePage from '@/pages/shelter/ShelterHomePage'
import AdminHomePage from '@/pages/admin/AdminHomePage'
import NotFoundPage from '@/pages/NotFoundPage'
import { AuthProvider } from '@/context/AuthProvider'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ROLES } from '@/utils/roles'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />

        <Route
          path="/adoptante/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADOPTER]}>
              <AdopterHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refugio/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SHELTER]}>
              <ShelterHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
