import { useNavigate } from 'react-router'
import Button from './Button'
import { logoutUser } from '../services/authService'

function LogoutButton() {
  const navigate = useNavigate()

  async function handleLogout() {
    await logoutUser()
    navigate('/login', { replace: true })
  }

  return <Button onClick={handleLogout}>Cerrar sesión</Button>
}

export default LogoutButton
