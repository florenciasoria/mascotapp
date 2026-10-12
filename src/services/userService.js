// Servicio de perfiles de usuario en Firestore
import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'

// Actualiza los datos editables del perfil (las reglas validan qué campos puede tocar cada rol)
export function updateUserProfile(uid, changes) {
  const data = Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
  )
  return updateDoc(doc(db, 'users', uid), data)
}
