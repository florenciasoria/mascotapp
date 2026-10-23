import { Outlet } from 'react-router'
import Sidebar from './Sidebar'
import styles from './AppLayout.module.css'

/** Estructura de las áreas de cada rol: menú lateral y contenido de la ruta actual. */
function AppLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
