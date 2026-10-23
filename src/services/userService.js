// Perfiles de usuario (colección "users").
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { pauseShelterPets } from './petService'
import { removeShelterPublicProfile } from './shelterService'
import { sortByNewest } from '@/utils/dates'
import { ROLES, STATUS } from '@/utils/roles'

const usersCollection = collection(db, 'users')

/**
 * Actualiza los datos editables del perfil (las reglas validan qué campos puede cambiar cada rol).
 * @param {string} uid
 * @param {object} changes
 * @returns {Promise<void>}
 */
export function updateUserProfile(uid, changes) {
  const data = Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  )
  return updateDoc(doc(db, 'users', uid), data)
}

/** Convierte un documento de Firestore en un objeto con su id. */
function toUser(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Todos los usuarios, del más nuevo al más viejo (solo administradores).
 * @returns {Promise<object[]>}
 */
export async function getAllUsers() {
  const snapshot = await getDocs(usersCollection)
  return sortByNewest(snapshot.docs.map(toUser))
}

/**
 * Un usuario por su ID.
 * @param {string} uid
 * @returns {Promise<object|null>} El usuario, o null si no existe.
 */
export async function getUser(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? toUser(snapshot) : null
}

/**
 * Cambia el estado de una cuenta (aprobar, rechazar o reactivar).
 * @param {string} uid
 * @param {string} status
 * @returns {Promise<void>}
 */
export function updateUserStatus(uid, status) {
  return updateDoc(doc(db, 'users', uid), {
    status,
    statusUpdatedAt: serverTimestamp(),
  })
}

/**
 * Registra en el perfil que el usuario verificó su email
 * (el administrador no puede consultar Authentication, pero sí el perfil).
 * @param {string} uid
 * @returns {Promise<void>}
 */
export function markEmailVerified(uid) {
  return updateDoc(doc(db, 'users', uid), { emailVerified: true })
}

/**
 * Desactiva una cuenta (baja lógica). Si es un refugio, pausa sus mascotas
 * y borra su perfil público.
 * @param {object} account
 * @returns {Promise<void>}
 */
export async function deactivateAccount(account) {
  await updateUserStatus(account.id, STATUS.INACTIVE)
  if (account.role === ROLES.SHELTER) {
    await pauseShelterPets(account.id)
    await removeShelterPublicProfile(account.id)
  }
}

/**
 * Cantidad de refugios pendientes de aprobación.
 * @returns {Promise<number>}
 */
export async function countPendingShelters() {
  const snapshot = await getCountFromServer(
    query(
      usersCollection,
      where('role', '==', ROLES.SHELTER),
      where('status', '==', STATUS.PENDING),
    ),
  )
  return snapshot.data().count
}
