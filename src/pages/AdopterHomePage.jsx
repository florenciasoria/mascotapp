import { useAuth } from '../hooks/useAuth'
import LogoutButton from '../components/LogoutButton'

function AdopterHomePage() {
  const { profile } = useAuth()

  return (
    <main>
      <h1>Área del adoptante</h1>
      <p>Hola, {profile?.name}</p>
      <LogoutButton />
    </main>
  )
}

export default AdopterHomePage
