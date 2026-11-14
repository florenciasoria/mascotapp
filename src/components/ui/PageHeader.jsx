import styles from './PageHeader.module.css'

/**
 * Encabezado de página: título y subtítulo.
 * @param {object} props
 * @param {React.ReactNode} props.title - Título.
 * @param {string} [props.subtitle] - Subtítulo.
 * @param {React.ReactNode} [props.actions] - Acciones a la derecha del título (por ejemplo, descargar un reporte).
 */
function PageHeader({ title, subtitle, actions }) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions}
    </header>
  )
}

export default PageHeader
