import { useId, useState } from 'react'
import styles from './Input.module.css'

// Campo de formulario con label, texto de ayuda y mensaje de error accesibles.
// - type="password" agrega un botón para mostrar u ocultar la contraseña.
// - multiline muestra un área de texto de varias líneas.
function Input({ label, hint, error, id, type = 'text', multiline = false, ...props }) {
  const generatedId = useId()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const isPassword = type === 'password'

  // El lector de pantalla lee la ayuda y el error al entrar al campo
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  const fieldProps = {
    id: inputId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    ...props,
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      {multiline ? (
        <textarea className={`${styles.input} ${styles.textarea}`} rows={4} {...fieldProps} />
      ) : (
        <div className={styles.inputWrapper}>
          <input
            className={isPassword ? `${styles.input} ${styles.withToggle}` : styles.input}
            type={isPassword && isPasswordVisible ? 'text' : type}
            {...fieldProps}
          />
          {isPassword && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setIsPasswordVisible((visible) => !visible)}
              aria-label="Mostrar contraseña"
              aria-pressed={isPasswordVisible}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
                {isPasswordVisible && <path d="M3 3l18 18" />}
              </svg>
            </button>
          )}
        </div>
      )}

      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
