import styles from './Button.module.css'

/**
 * Botón de acción.
 * @param {object} props
 * @param {'primary'|'secondary'|'link'|'back'} [props.variant] - Estilo del botón.
 * @param {'md'|'sm'} [props.size] - Tamaño.
 * @param {boolean} [props.isLoading] - Muestra la carga y lo deshabilita (evita el doble envío).
 */
function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${size === 'sm' ? styles.sm : ''}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? 'Cargando…' : children}
    </button>
  )
}

export default Button
