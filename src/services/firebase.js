// Inicialización de Firebase: exporta auth, db y storage para el resto de los servicios.
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Configuración leída de las variables de entorno (.env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Si falta alguna variable, se informa con un mensaje claro
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
// Emails de Firebase (verificación y recuperación de contraseña) en español
auth.languageCode = 'es'

export const db = getFirestore(app)

export const storage = getStorage(app)
