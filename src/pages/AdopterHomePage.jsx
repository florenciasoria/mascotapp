import { useAuth } from '../hooks/useAuth'

function AdopterHomePage() {
  const { profile } = useAuth()

  return (
    <main>
      <h1>Área del adoptante</h1>
      <p>Hola, {profile?.name}</p>
    </main>
  )
}

export default AdopterHomePage
