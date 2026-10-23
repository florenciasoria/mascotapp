import { useEffect, useId, useMemo } from 'react'
import styles from './ImageUpload.module.css'

function UploadIcon() {
  return (
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
      <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
    </svg>
  )
}

/**
 * Selector de la foto de una mascota, con vista previa.
 * El input de archivo queda oculto a la vista pero accesible con teclado y lector de pantalla.
 * @param {object} props
 * @param {File|null} props.file - Foto nueva elegida.
 * @param {string} [props.currentUrl] - Foto actual (al editar).
 * @param {(file: File|null) => void} props.onFileChange - Se llama al elegir una foto.
 * @param {string} [props.error] - Mensaje de error.
 */
function ImageUpload({ file, currentUrl, onFileChange, error }) {
  const inputId = useId()
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const shownUrl = previewUrl ?? currentUrl
  const describedBy = [hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className={styles.field}>
      <span className={styles.label} id={`${inputId}-label`}>
        Foto de la mascota
      </span>

      <div className={styles.row}>
        {shownUrl && (
          <img src={shownUrl} alt="Vista previa de la foto elegida" className={styles.preview} />
        )}

        <input
          id={inputId}
          type="file"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          onChange={(event) => onFileChange(event.target.files[0] ?? null)}
          aria-labelledby={`${inputId}-label ${inputId}-button`}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
        <label htmlFor={inputId} id={`${inputId}-button`} className={styles.fileButton}>
          <UploadIcon />
          {shownUrl ? 'Cambiar foto' : 'Elegir foto'}
        </label>
      </div>

      <p id={hintId} className={styles.hint}>
        JPG, PNG o WEBP. La foto se ajusta automáticamente.
      </p>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUpload
