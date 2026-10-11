// Servicio de autenticación: el único lugar de la app que usa
// Firebase Auth y que escribe perfiles de usuario en Firestore.
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ROLES, STATUS } from '../utils/roles'
// Después de hacer clic en el enlace del email, Firebase ofrece volver al login
const actionCodeSettings = { url: `${window.location.origin}/login` }

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

    // Si falla el envío no cancelamos el registro: se puede reenviar desde la app
  try {
    await sendEmailVerification(user, actionCodeSettings)
  } catch {
    // El usuario puede pedir el reenvío desde la pantalla de verificación
  }

  return profile
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export function logoutUser() {
  return signOut(auth)
}

export function resendVerificationEmail() {
  return sendEmailVerification(auth.currentUser, actionCodeSettings)
}

// Firebase envía un email con un enlace para crear una contraseña nueva.
// Por seguridad, no avisa si el email no está registrado.
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email.trim(), actionCodeSettings)
}

// Vuelve a consultar a Firebase si el usuario ya verificó su email
export async function checkEmailVerified() {
  await auth.currentUser.reload()
  // Renovamos el token para que las reglas de Firestore también lo sepan
  await auth.currentUser.getIdToken(true)
  return auth.currentUser.emailVerified
}

// Avisa cada vez que cambia la sesión (login, logout o al recargar la página).
// Devuelve una función para dejar de escuchar.
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback)
}

// Escucha en tiempo real el perfil del usuario (rol, estado, datos).
// Devuelve null si el perfil no existe o no se puede leer.
export function subscribeToUserProfile(uid, callback) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => callback(snapshot.exists() ? snapshot.data() : null),
    () => callback(null),
  )
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
