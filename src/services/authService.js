// Servicio de autenticación: el único lugar de la app que usa
// Firebase Auth y que escribe perfiles de usuario en Firestore.
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ROLES, STATUS } from '../utils/roles'

export async function registerUser({ role, name, email, password, phone, address, about }) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)

  const profile = {
    role,
    // Los refugios esperan aprobación de un admin; los adoptantes entran directo
    status: role === ROLES.SHELTER ? STATUS.PENDING : STATUS.APPROVED,
    name: name.trim(),
    email: user.email,
    phone: phone.trim(),
    address: address.trim(),
    createdAt: serverTimestamp(),
  }
  if (role === ROLES.SHELTER) {
    profile.about = about.trim()
  }

  try {
    await setDoc(doc(db, 'users', user.uid), profile)
  } catch (error) {
    // Si no se pudo guardar el perfil, borramos la cuenta recién creada
    // para no dejar un usuario "a medias" sin rol.
    await deleteUser(user)
    throw error
  }

  return profile
}

// Traduce los códigos de error de Firebase a mensajes para el usuario.
export function getAuthErrorMessage(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese email'
    case 'auth/invalid-email':
      return 'El email no es válido'
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil'
    case 'auth/network-request-failed':
      return 'No hay conexión. Revisá tu internet e intentá de nuevo'
    default:
      return 'Ocurrió un error inesperado. Intentá de nuevo'
  }
}
