import styles from './LoadingScreen.module.css'

// Se muestra mientras se verifica la sesión
function LoadingScreen() {
  return (
    <main className={styles.loading}>
      <p role="status">Cargando…</p>
    </main>
  )
}

export default LoadingScreen
