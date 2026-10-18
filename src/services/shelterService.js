// Perfiles públicos de los refugios: lo único que los adoptantes pueden ver de un refugio
// (nombre, barrio y descripción). El perfil completo en "users" sigue siendo privado.
import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const sheltersCollection = collection(db, 'shelters')

// Publica o actualiza el perfil público con los datos actuales del refugio.
// Si ya está igual, no escribe nada. Lo llama el propio refugio (las reglas lo exigen).
export async function syncShelterPublicProfile(uid, { name, neighborhood, about }) {
  const ref = doc(db, 'shelters', uid)
  const current = (await getDoc(ref)).data()
  if (current?.name === name && current?.neighborhood === neighborhood && current?.about === about) {
    return
  }
  await setDoc(ref, { name, neighborhood, about, updatedAt: serverTimestamp() })
}

// Al desactivar un refugio, deja de mostrarse a los adoptantes (lo hace el admin)
export function removeShelterPublicProfile(uid) {
  return deleteDoc(doc(db, 'shelters', uid))
}

// Un refugio por su ID (o null si no tiene perfil público)
export async function getPublicShelter(uid) {
  const snapshot = await getDoc(doc(db, 'shelters', uid))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null
}

// Todos los refugios activos, ordenados por nombre
// (aparecen aunque no tengan mascotas publicadas: igual pueden recibir donaciones)
export async function getPublicShelters() {
  const snapshot = await getDocs(sheltersCollection)
  return snapshot.docs
    .map((shelter) => ({ id: shelter.id, ...shelter.data() }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
