// Autenticación (Firebase Authentication) y alta de perfiles.
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ROLES, STATUS } from '@/utils/roles'
// Después de usar el enlace del email, Firebase ofrece volver al login
const actionCodeSettings = { url: `${window.location.origin}/login` }

/**
 * Registra un usuario: crea la cuenta, guarda su perfil y envía el email de verificación.
 * Si no se puede guardar el perfil, borra la cuenta creada para no dejarla incompleta.
 * Los refugios quedan pendientes de aprobación; los adoptantes, aprobados.
 * @param {object} data - Datos del formulario de registro.
 * @returns {Promise<object>} El perfil guardado.
 */
export async function registerUser({
  role,
  name,
  email,
  password,
  phone,
  address,
  neighborhood,
  about,
}) {
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password)

  const profile = {
    role,
    // Los refugios esperan la aprobación de un administrador
    status: role === ROLES.SHELTER ? STATUS.PENDING : STATUS.APPROVED,
    name: name.trim(),
    email: user.email,
    phone: phone.trim(),
    address: address.trim(),
    createdAt: serverTimestamp(),
  }
  if (role === ROLES.SHELTER) {
    profile.neighborhood = neighborhood
    profile.about = about.trim()
  }

  try {
    await setDoc(doc(db, 'users', user.uid), profile)
  } catch (error) {
    // Si falla el perfil, se borra la cuenta recién creada
    await deleteUser(user)
    throw error
  }

  // Un error al enviar el email no cancela el registro: se puede reenviar
  try {
    await sendEmailVerification(user, actionCodeSettings)
  } catch {
    // Se puede reenviar desde la pantalla de verificación
  }

  return profile
}

/**
 * Inicia sesión.
 * @param {string} email
 * @param {string} password
 * @param {boolean} [rememberMe] - true: la sesión persiste al cerrar el navegador;
 * false: dura lo que la pestaña (más seguro en computadoras compartidas).
 * @returns {Promise<object>}
 */
export async function loginUser(email, password, rememberMe = false) {
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

/**
 * Cierra la sesión.
 * @returns {Promise<void>}
 */
export function logoutUser() {
  return signOut(auth)
}

/**
 * Reenvía el email de verificación al usuario actual.
 * @returns {Promise<void>}
 */
export function resendVerificationEmail() {
  return sendEmailVerification(auth.currentUser, actionCodeSettings)
}

/**
 * Envía el email para crear una contraseña nueva.
 * Por seguridad, Firebase no informa si el email no está registrado.
 * @param {string} email
 * @returns {Promise<void>}
 */
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim(), actionCodeSettings)
}

/**
 * Vuelve a consultar si el usuario verificó su email y renueva el token
 * para que las reglas de Firestore reciban el dato actualizado.
 * @returns {Promise<boolean>}
 */
export async function checkEmailVerified() {
  await auth.currentUser.reload()
  await auth.currentUser.getIdToken(true)
  return auth.currentUser.emailVerified
}

/**
 * Escucha los cambios de sesión (inicio, cierre o recarga de la página).
 * @param {(user: object|null) => void} callback
 * @returns {() => void} Función para dejar de escuchar.
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}

/**
 * Escucha en tiempo real el perfil de un usuario.
 * @param {string} uid
 * @param {(profile: object|null) => void} callback - Recibe null si el perfil no existe o no se puede leer.
 * @returns {() => void} Función para dejar de escuchar.
 */
export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => callback(snapshot.exists() ? snapshot.data() : null),
    () => callback(null),
  )
}

/**
 * Traduce un error de Firebase Authentication a un mensaje para el usuario.
 * @param {{code: string}} error
 * @returns {string}
 */
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
    case 'auth/invalid-credential':
      return 'Email o contraseña incorrectos'
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo'
    case 'auth/user-disabled':
      return 'Esta cuenta fue deshabilitada'
    default:
      return 'Ocurrió un error inesperado. Intentá de nuevo'
  }
}
