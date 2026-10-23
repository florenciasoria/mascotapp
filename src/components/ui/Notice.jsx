import ButtonLink from './ButtonLink'
import styles from './Notice.module.css'

/**
 * Aviso destacado con una acción (avisos del Inicio).
 * @param {object} props
 * @param {string} props.to - Ruta de la acción.
 * @param {string} props.actionLabel - Texto del botón.
 */
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
