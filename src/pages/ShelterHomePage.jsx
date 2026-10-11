import { useAuth } from '../hooks/useAuth'

function ShelterHomePage() {
  const { profile } = useAuth()

  return (
    <main>
      <h1>Área del refugio</h1>
      <p>Hola, {profile?.name} (estado: {profile?.status})</p>
    </main>
  )
}

export default ShelterHomePage
