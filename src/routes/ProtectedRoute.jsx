import { Navigate } from 'react-router'
import LoadingScreen from '@/components/ui/LoadingScreen'
import PendingApprovalPage from '@/pages/auth/PendingApprovalPage'
import { useAuth } from '@/hooks/useAuth'
import { getHomePath, STATUS } from '@/utils/roles'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'


// Guardia de rutas: solo deja pasar a usuarios logueados, aprobados
// y con alguno de los roles permitidos.
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

  if (!isEmailVerified) {
    return <VerifyEmailPage />
  }

  if (profile.status === STATUS.PENDING) {
    return <PendingApprovalPage />
  }

  return children
}

export default ProtectedRoute
