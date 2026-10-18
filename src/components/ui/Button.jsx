import styles from './Button.module.css'

// Botón principal de la app.
// isLoading lo deshabilita mientras se espera una respuesta (evita doble envío).
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
