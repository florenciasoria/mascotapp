import styles from './LoadingScreen.module.css'

/** Pantalla de carga mientras se verifica la sesión. */
function LoadingScreen() {
  return (
    <main className={styles.loading}>
      <p role="status">Cargando…</p>
    </main>
  )
}

export default LoadingScreen
