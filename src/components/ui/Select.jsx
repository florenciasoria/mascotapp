import { useId } from 'react'
import styles from './Input.module.css'

/**
 * Lista desplegable con label y error accesibles (mismo estilo que Input).
 * @param {object} props
 * @param {string} props.label - Etiqueta.
 * @param {(string|{value: string, label: string})[]} props.options - Opciones.
 * @param {string} [props.placeholder] - Opción inicial deshabilitada.
 * @param {string} [props.error] - Mensaje de error.
 */
function Select({ label, error, id, options, placeholder, ...props }) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        className={styles.input}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const { value, label: optionLabel } =
            typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          )
        })}
      </select>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

export default Select
