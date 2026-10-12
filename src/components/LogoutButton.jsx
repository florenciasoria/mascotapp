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
    <Button variant="link" onClick={handleLogout}>
      Cerrar sesión
    </Button>
  )
}

export default LogoutButton
