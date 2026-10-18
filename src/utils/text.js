// Pasa a minúsculas y quita las tildes: así "lujan" encuentra "Luján".
// Se usa en los buscadores para comparar textos sin importar mayúsculas ni acentos.
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
