import styles from './Card.module.css'

// Tarjeta blanca base. "as" permite elegir la etiqueta (div, article, section…)
function Card({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`${styles.card} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Card
