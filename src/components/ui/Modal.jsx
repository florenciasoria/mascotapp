import { useEffect, useId, useRef } from 'react'
import styles from './Modal.module.css'

// Ventana modal accesible basada en <dialog>: atrapa el foco,
// se cierra con Escape y devuelve el foco al elemento que la abrió.
function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  // Sincroniza el estado de React (isOpen) con el <dialog> del navegador
  useEffect(() => {
    const dialog = dialogRef.current
    if (isOpen && !dialog.open) {
      dialog.showModal()
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  // Clic en el fondo oscuro: cierra
  function handleClick(event) {
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby={titleId}
    >
      <div className={styles.content}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  )
}

export default Modal
