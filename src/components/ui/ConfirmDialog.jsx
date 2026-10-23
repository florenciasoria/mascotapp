import Modal from './Modal'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

/**
 * Pide confirmación antes de una acción importante. El foco inicial está en "Cancelar".
 * @param {object} props
 * @param {boolean} props.isOpen - Si está abierto.
 * @param {() => void} props.onClose - Cierra sin confirmar.
 * @param {() => void} props.onConfirm - Confirma la acción.
 * @param {string} props.title - Pregunta.
 * @param {string} [props.message] - Detalle de la acción.
 * @param {string} [props.confirmLabel] - Texto del botón de confirmación.
 * @param {string} [props.cancelLabel] - Texto del botón de cancelación.
 * @param {boolean} [props.isLoading] - Muestra la carga en la confirmación.
 */
function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className={styles.message}>{message}</p>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading} autoFocus>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
