import { useId } from 'react'
import styles from './ToggleGroup.module.css'

const YES_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]

// Pregunta con opciones tipo "pastilla" (por defecto Sí / No).
// Son radios nativos dentro de un fieldset: se usan con teclado (flechas)
// y el lector de pantalla lee la pregunta (legend) junto con cada opción.
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
