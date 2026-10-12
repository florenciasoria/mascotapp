import Modal from './Modal'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

// Pide confirmación antes de una acción importante (desactivar, rechazar, etc.).
// El foco arranca en "Cancelar": si alguien aprieta Enter sin leer, no pasa nada grave.
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
