import { useId } from 'react'
import styles from './ToggleGroup.module.css'

const YES_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]

/**
 * Pregunta con opciones tipo pastilla (por defecto Sí / No).
 * Usa radios nativos dentro de un fieldset: se maneja con el teclado y el lector de pantalla
 * lee la pregunta junto con cada opción.
 * @param {object} props
 * @param {string} props.label - Pregunta.
 * @param {string} props.name - Nombre del campo.
 * @param {string} props.value - Opción elegida.
 * @param {(event: Event) => void} props.onChange - Cambio de opción.
 * @param {string} [props.error] - Mensaje de error.
 * @param {{value: string, label: string}[]} [props.options] - Opciones.
 */
function ToggleGroup({ label, name, value, onChange, error, options = YES_NO }) {
  const errorId = `${useId()}-error`

  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.options} data-invalid={error ? true : undefined}>
        {options.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default ToggleGroup
