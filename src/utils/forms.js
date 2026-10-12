// Lleva el foco al primer campo con error, en el orden en que aparecen
// en pantalla. Devuelve true si hay errores.
export function focusFirstInvalidField(form, errors) {
  const firstInvalid = Array.from(form.elements).find((element) => errors[element.name])
  firstInvalid?.focus()
  return Object.keys(errors).length > 0
}
