// Perfiles públicos de los refugios (colección "shelters"): nombre, barrio y descripción.
// El perfil completo, en "users", es privado.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'

const sheltersCollection = collection(db, 'shelters')

/**
 * Publica o actualiza el perfil público del refugio. Si no hay cambios, no escribe.
 * @param {string} uid - ID del refugio.
 * @param {{name: string, neighborhood: string, about: string}} data
 * @returns {Promise<void>}
 */
export async function syncShelterPublicProfile(uid, { name, neighborhood, about }) {
  const ref = doc(db, 'shelters', uid)
  const current = (await getDoc(ref)).data()
  if (
    current?.name === name &&
    current?.neighborhood === neighborhood &&
    current?.about === about
  ) {
    return
  }
  await setDoc(ref, { name, neighborhood, about, updatedAt: serverTimestamp() })
}

/**
 * Borra el perfil público de un refugio (al desactivarlo).
 * @param {string} uid
 * @returns {Promise<void>}
 */
export function removeShelterPublicProfile(uid) {
  return deleteDoc(doc(db, 'shelters', uid))
}

/**
 * Perfil público de un refugio.
 * @param {string} uid
 * @returns {Promise<object|null>} El perfil, o null si no existe.
 */
export async function getPublicShelter(uid) {
  const snapshot = await getDoc(doc(db, 'shelters', uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

/**
 * Perfiles públicos de todos los refugios activos, ordenados por nombre.
 * @returns {Promise<object[]>}
 */
export async function getPublicShelters() {
  const snapshot = await getDocs(sheltersCollection)
  return snapshot.docs
    .map((shelter) => ({ id: shelter.id, ...shelter.data() }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
