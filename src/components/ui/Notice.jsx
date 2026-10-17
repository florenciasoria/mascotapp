import ButtonLink from './ButtonLink'
import styles from './Notice.module.css'

// Aviso destacado con una acción. Se usa en el Inicio de cada rol
// para avisar que hay algo nuevo o algo para revisar.
function Notice({ children, to, actionLabel }) {
  return (
    <div className={styles.notice}>
      <p className={styles.text}>{children}</p>
      <ButtonLink to={to} size="sm">
        {actionLabel}
      </ButtonLink>
    </div>
  )
}

export default Notice
