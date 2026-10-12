import { useAuth } from '@/hooks/useAuth'

function ShelterHomePage() {
  const { profile } = useAuth()

  return (
    <>
      <h1>Área del refugio</h1>
      <p>Hola, {profile?.name} (estado: {profile?.status})</p>
    </>
  )
}

export default ShelterHomePage
