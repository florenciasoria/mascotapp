import { useId } from 'react'
import styles from './Stars.module.css'

const SCORES = ['1', '2', '3', '4', '5']

/**
 * Selector de 1 a 5 estrellas. Usa radios nativos: se maneja con las flechas del teclado
 * y el lector de pantalla anuncia "N de 5 estrellas".
 * @param {object} props
 * @param {string} props.label - Pregunta.
 * @param {string} props.name - Nombre del campo.
 * @param {string} props.value - Puntaje elegido ("1" a "5") o "".
 * @param {(event: Event) => void} props.onChange - Cambio de puntaje.
 * @param {string} [props.error] - Mensaje de error.
 */
function StarRating({ label, name, value, onChange, error }) {
  const errorId = `${useId()}-error`
  const selected = Number(value) || 0

  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.stars}>
        {SCORES.map((score) => (
          <label key={score} className={styles.star}>
            <input
              type="radio"
              name={name}
              value={score}
              checked={value === score}
              onChange={onChange}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            <span
              aria-hidden="true"
              className={Number(score) <= selected ? styles.filled : styles.empty}
            >
              {Number(score) <= selected ? '★' : '☆'}
            </span>
            <span className={styles.srOnly}>{score} de 5 estrellas</span>
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

export default StarRating
