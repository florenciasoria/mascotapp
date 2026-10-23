import { Navigate } from 'react-router'
import AccountStatusPage from '@/pages/auth/AccountStatusPage'
import PendingApprovalPage from '@/pages/auth/PendingApprovalPage'
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useAuth } from '@/hooks/useAuth'
import { getHomePath, STATUS } from '@/utils/roles'

// Estados de cuenta habilitados para entrar (lista blanca): cualquier otro queda bloqueado.
const ALLOWED_STATUSES = [STATUS.PENDING, STATUS.APPROVED]

/**
 * Protege un área de la app: exige sesión, uno de los roles permitidos, estado habilitado
 * y email verificado. Si falta algo, redirige o muestra la pantalla que corresponde.
 * La seguridad de los datos la aplican las reglas de Firestore; este componente es de navegación.
 * @param {object} props
 * @param {string[]} props.allowedRoles - Roles que pueden entrar.
 * @param {React.ReactNode} props.children - Contenido protegido.
 */
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
