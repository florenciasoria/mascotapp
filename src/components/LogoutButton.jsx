import { useNavigate } from 'react-router'
import Button from '@/components/ui/Button'
import { logoutUser } from '@/services/authService'

function LogoutButton() {
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    navigate('/login', { replace: true })
  }

    return (
    <Button variant="secondary" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  )
}

export default LogoutButton
