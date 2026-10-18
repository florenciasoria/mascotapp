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
import AppLayout from '@/layouts/AppLayout'
import ComingSoonPage from '@/pages/ComingSoonPage'
import ProfilePage from '@/pages/shared/ProfilePage'
import ShelterPetsPage from '@/pages/shelter/ShelterPetsPage'
import RegisterPetPage from '@/pages/shelter/RegisterPetPage'
import EditPetPage from '@/pages/shelter/EditPetPage'
import SearchPetsPage from '@/pages/adopter/SearchPetsPage'
import PetDetailPage from '@/pages/adopter/PetDetailPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminUserDetailPage from '@/pages/admin/AdminUserDetailPage'
import RequestAdoptionPage from '@/pages/adopter/RequestAdoptionPage'
import MyRequestsPage from '@/pages/adopter/MyRequestsPage'
import AdopterRequestDetailPage from '@/pages/adopter/AdopterRequestDetailPage'
import ShelterRequestsPage from '@/pages/shelter/ShelterRequestsPage'
import ShelterRequestDetailPage from '@/pages/shelter/ShelterRequestDetailPage'
import AdoptionHistoryPage from '@/pages/shared/AdoptionHistoryPage'
import RateAdoptionPage from '@/pages/adopter/RateAdoptionPage'
import ShelterRatingsPage from '@/pages/shelter/ShelterRatingsPage'
import DonationSheltersPage from '@/pages/adopter/DonationSheltersPage'
import DonationFormPage from '@/pages/adopter/DonationFormPage'

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
          <Route path="*" element={<ComingSoonPage />} />
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
          <Route path="*" element={<ComingSoonPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
