/**
 * Lleva el foco al primer campo con error, en el orden en que aparecen en pantalla.
 * @param {HTMLFormElement} form
 * @param {Object<string, string>} errors
 * @returns {boolean} true si hay errores.
 */
export function focusFirstInvalidField(form, errors) {
  const firstInvalid = Array.from(form.elements).find((element) => errors[element.name])
  firstInvalid?.focus()
  return Object.keys(errors).length > 0
}

/**
 * Errores sin el del campo indicado, para borrarlo mientras el usuario lo corrige.
 * @param {Object<string, string>} errors
 * @param {string} name
 * @returns {Object<string, string>} Los mismos errores si el campo no tenía (evita re-renderizar).
 */
export function withoutError(errors, name) {
  if (!errors[name]) return errors
  const next = { ...errors }
  delete next[name]
  return next
}
