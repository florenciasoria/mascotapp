import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { logoutUser } from '@/services/authService'
import { MENUS } from '@/utils/menus'
import styles from './Sidebar.module.css'

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

// Menú lateral: un <dialog> nativo que se abre desde el botón hamburguesa.
function Sidebar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const dialogRef = useRef(null)
  const menu = MENUS[profile.role]

  function openMenu() {
    dialogRef.current.showModal()
  }

  function closeMenu() {
    dialogRef.current.close()
  }

  // Un clic en el fondo oscuro (fuera del panel) cierra el menú
  function handleDialogClick(event) {
    if (event.target === dialogRef.current) {
      closeMenu()
    }
  }

  async function handleLogout() {
    closeMenu()
    await logoutUser()
    navigate('/login', { replace: true })
  }

  const linkClassName = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link

  return (
    <header className={styles.topBar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={openMenu}
        aria-label="Abrir menú"
        aria-haspopup="dialog"
      >
        <MenuIcon />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.drawer}
        onClick={handleDialogClick}
        aria-label="Menú principal"
      >
        <div className={styles.panel}>
          <button
            type="button"
            className={`${styles.menuButton} ${styles.closeButton}`}
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            <MenuIcon />
          </button>

          <nav className={styles.nav} aria-label="Menú principal">
            <ul className={styles.list}>
              {menu.main.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClassName}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <ul className={styles.list}>
              <li>
                <NavLink to={menu.profile.to} className={linkClassName} onClick={closeMenu}>
                  {menu.profile.label}
                </NavLink>
              </li>
              <li>
                <button type="button" className={styles.link} onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </dialog>
    </header>
  )
}

export default Sidebar
