import styles from './Card.module.css'

/**
 * Tarjeta base.
 * @param {object} props
 * @param {string} [props.as] - Etiqueta HTML a usar (div, article, section…).
 */
function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`${styles.card} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Card
