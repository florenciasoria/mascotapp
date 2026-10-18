import styles from './AuthLayout.module.css'

// Estructura de las pantallas de autenticación (login y registro):
// contenido centrado; "wide" para formularios de dos columnas.
function AuthLayout({ children, wide = false }) {
  return (
    <main className={styles.layout}>
      <div className={wide ? `${styles.content} ${styles.wide}` : styles.content}>{children}</div>
    </main>
  )
}

export default AuthLayout
