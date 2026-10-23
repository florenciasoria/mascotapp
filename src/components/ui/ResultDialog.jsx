import Modal from './Modal'
import Button from './Button'
import styles from './ResultDialog.module.css'

function SuccessIcon() {
  return (
    <svg
      aria-hidden="true"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      aria-hidden="true"
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

/**
 * Diálogo con el resultado de una operación (éxito o error).
 * @param {object} props
 * @param {boolean} props.isOpen - Si está abierto.
 * @param {() => void} props.onClose - Cierra el diálogo.
 * @param {'success'|'error'} [props.type] - Tipo de resultado.
 * @param {string} props.title - Título.
 * @param {string} [props.message] - Detalle.
 * @param {string} [props.actionLabel] - Texto del botón.
 * @param {() => void} [props.onAction] - Acción del botón (por defecto, cerrar).
 */
function ResultDialog({
  isOpen,
  onClose,
  type = 'success',
  title,
  message,
  actionLabel,
  onAction,
}) {
  const isSuccess = type === 'success'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className={styles.body}>
        <span className={isSuccess ? styles.successIcon : styles.errorIcon}>
          {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
        </span>
        <p className={styles.message}>{message}</p>
        <Button onClick={onAction ?? onClose} autoFocus>
          {actionLabel ?? (isSuccess ? 'Aceptar' : 'Reintentar')}
        </Button>
      </div>
    </Modal>
  )
}

export default ResultDialog
