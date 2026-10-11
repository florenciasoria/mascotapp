import { Navigate } from 'react-router'
import LoadingScreen from '@/components/ui/LoadingScreen'
import AccountStatusPage from '@/pages/auth/AccountStatusPage'
import PendingApprovalPage from '@/pages/auth/PendingApprovalPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import { useAuth } from '@/hooks/useAuth'
import { getHomePath, STATUS } from '@/utils/roles'

// Estados con los que se puede entrar a la app (lista blanca):
// cualquier otro estado queda bloqueado.
const ALLOWED_STATUSES = [STATUS.PENDING, STATUS.APPROVED]

// Guardia de rutas: solo deja pasar a usuarios logueados, habilitados,
// con email verificado y con alguno de los roles permitidos.
function ProtectedRoute({ allowedRoles, children }) {
  const { user, profile, isLoading, isEmailVerified } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={getHomePath(profile.role)} replace />
  }

  if (!ALLOWED_STATUSES.includes(profile.status)) {
    return <AccountStatusPage status={profile.status} />
  }

  if (!isEmailVerified) {
    return <VerifyEmailPage />
  }

  if (profile.status === STATUS.PENDING) {
    return <PendingApprovalPage />
  }

  return children
}

export default ProtectedRoute
