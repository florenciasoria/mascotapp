import { useAuth } from '@/hooks/useAuth'
import LogoutButton from '@/components/LogoutButton'

function ShelterHomePage() {
  const { profile } = useAuth()

  return (
    <main>
      <h1>Área del refugio</h1>
      <p>Hola, {profile?.name} (estado: {profile?.status})</p>
      <LogoutButton />
    </main>
  )
}

export default ShelterHomePage
