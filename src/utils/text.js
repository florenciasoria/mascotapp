/**
 * Pasa a minúsculas y quita las tildes, para buscar sin distinguir mayúsculas ni acentos.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
