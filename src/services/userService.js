// Servicio de perfiles de usuario en Firestore
import { collection, doc, getCountFromServer, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from './firebase'
import { pauseShelterPets } from './petService'
import { removeShelterPublicProfile } from './shelterService'
import { ROLES, STATUS } from '@/utils/roles'

// Actualiza los datos editables del perfil (las reglas validan qué campos puede tocar cada rol)
export function updateUserProfile(uid, changes) {
  const data = Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )
  return updateDoc(doc(db, 'users', uid), data)
}

const usersCollection = collection(db, 'users')

// Pasa un documento a un objeto con su id
function toUser(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// Todos los usuarios, del más nuevo al más viejo (solo el admin tiene permiso)
export async function getAllUsers() {
  const snapshot = await getDocs(usersCollection)
  return snapshot.docs
    .map(toUser)
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

export async function getUser(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? toUser(snapshot) : null
}

// Cambio de estado hecho por el admin (aprobar, rechazar, desactivar, reactivar)
export function updateUserStatus(uid, status) {
  return updateDoc(doc(db, 'users', uid), {
    status,
    statusUpdatedAt: serverTimestamp(),
  })
}

// Guarda en el perfil que el usuario verificó su email
// (el admin no puede consultar Authentication, pero sí el perfil)
export function markEmailVerified(uid) {
  return updateDoc(doc(db, 'users', uid), { emailVerified: true })
}

// Desactivar una cuenta. Si es un refugio, además se pausan sus mascotas publicadas
// y se borra su perfil público (deja de aparecer para donar).
// Si después se reactiva, el refugio vuelve a publicarlo al entrar a su Inicio.
export async function deactivateAccount(account) {
  await updateUserStatus(account.id, STATUS.INACTIVE)
  if (account.role === ROLES.SHELTER) {
    await pauseShelterPets(account.id)
    await removeShelterPublicProfile(account.id)
  }
}

// Cuántos refugios esperan la aprobación del admin
export async function countPendingShelters() {
  const snapshot = await getCountFromServer(
    query(
      collection(db, 'users'),
      where('role', '==', ROLES.SHELTER),
      where('status', '==', STATUS.PENDING),
    ),
  )
  return snapshot.data().count
}
