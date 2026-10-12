// Inicialización de Firebase.
// Es el único archivo que conoce la configuración del proyecto:
// el resto de la app importa `auth` y `db` desde acá.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Vite expone en import.meta.env solo las variables que empiezan con VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Si falta alguna variable, cortamos con un mensaje claro
// en lugar de dejar que Firebase falle con un error confuso.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  throw new Error(
    `Faltan variables de entorno de Firebase: ${missingKeys.join(', ')}. Revisá el archivo .env.local`,
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
// Los emails que envía Firebase (verificación, recuperar contraseña) en español
auth.languageCode = 'es'

export const db = getFirestore(app)

export const storage = getStorage(app)

