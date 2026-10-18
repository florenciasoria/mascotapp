import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from '@/context/AuthProvider'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { ROLES } from '@/utils/roles'
// Páginas públicas y compartidas
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProfilePage from '@/pages/shared/ProfilePage'
import AdoptionHistoryPage from '@/pages/shared/AdoptionHistoryPage'
// Adoptante
import AdopterHomePage from '@/pages/adopter/AdopterHomePage'
import SearchPetsPage from '@/pages/adopter/SearchPetsPage'
import PetDetailPage from '@/pages/adopter/PetDetailPage'
import RequestAdoptionPage from '@/pages/adopter/RequestAdoptionPage'
import MyRequestsPage from '@/pages/adopter/MyRequestsPage'
import AdopterRequestDetailPage from '@/pages/adopter/AdopterRequestDetailPage'
import RateAdoptionPage from '@/pages/adopter/RateAdoptionPage'
import MyDonationsPage from '@/pages/adopter/MyDonationsPage'
import DonationSheltersPage from '@/pages/adopter/DonationSheltersPage'
import DonationFormPage from '@/pages/adopter/DonationFormPage'
// Refugio
import ShelterHomePage from '@/pages/shelter/ShelterHomePage'
import ShelterPetsPage from '@/pages/shelter/ShelterPetsPage'
import RegisterPetPage from '@/pages/shelter/RegisterPetPage'
import EditPetPage from '@/pages/shelter/EditPetPage'
import ShelterRequestsPage from '@/pages/shelter/ShelterRequestsPage'
import ShelterRequestDetailPage from '@/pages/shelter/ShelterRequestDetailPage'
import ShelterRatingsPage from '@/pages/shelter/ShelterRatingsPage'
import ShelterDonationsPage from '@/pages/shelter/ShelterDonationsPage'
// Admin
import AdminHomePage from '@/pages/admin/AdminHomePage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import AdminSupervisionPage from '@/pages/admin/AdminSupervisionPage'

// Rutas de la app. Cada rol tiene su área (/adoptante, /refugio, /admin) con el menú lateral
// (AppLayout), protegida por ProtectedRoute, que controla sesión, rol y estado de la cuenta.
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
            path="/adoptante"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADOPTER]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdopterHomePage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="buscar" element={<SearchPetsPage />} />
            <Route path="mascotas/:petId" element={<PetDetailPage />} />
            <Route path="mascotas/:petId/solicitar" element={<RequestAdoptionPage />} />
            <Route path="solicitudes" element={<MyRequestsPage />} />
            <Route path="solicitudes/:requestId" element={<AdopterRequestDetailPage />} />
            <Route path="historial" element={<AdoptionHistoryPage />} />
            <Route path="historial/:requestId/calificar" element={<RateAdoptionPage />} />
            <Route path="donaciones" element={<MyDonationsPage />} />
            <Route path="donaciones/nueva" element={<DonationSheltersPage />} />
            <Route path="donaciones/nueva/:shelterId" element={<DonationFormPage />} />
          </Route>

          <Route
            path="/refugio"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SHELTER]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ShelterHomePage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="mascotas" element={<ShelterPetsPage />} />
            <Route path="mascotas/nueva" element={<RegisterPetPage />} />
            <Route path="mascotas/:petId/editar" element={<EditPetPage />} />
            <Route path="solicitudes" element={<ShelterRequestsPage />} />
            <Route path="solicitudes/:requestId" element={<ShelterRequestDetailPage />} />
            <Route path="historial" element={<AdoptionHistoryPage />} />
            <Route path="calificaciones" element={<ShelterRatingsPage />} />
            <Route path="donaciones" element={<ShelterDonationsPage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="usuarios/:userId" element={<AdminUserDetailPage />} />
            <Route path="supervision" element={<AdminSupervisionPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
