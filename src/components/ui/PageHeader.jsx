import styles from './PageHeader.module.css'

/**
 * Encabezado de página: título y subtítulo.
 * @param {object} props
 * @param {React.ReactNode} props.title - Título.
 * @param {string} [props.subtitle] - Subtítulo.
 */
function PageHeader({ title, subtitle }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  )
}

export default PageHeader
