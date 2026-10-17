import { useId } from 'react'
import styles from './Stars.module.css'

const SCORES = ['1', '2', '3', '4', '5']

// Elegir de 1 a 5 estrellas. Son radios nativos (como ToggleGroup): se usan con las flechas
// y el lector de pantalla anuncia "4 de 5 estrellas". Se llenan las estrellas hasta la elegida.
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
            <span aria-hidden="true" className={Number(score) <= selected ? styles.filled : styles.empty}>
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
