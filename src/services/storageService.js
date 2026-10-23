// Fotos de las mascotas (Firebase Storage).
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import { resizeImage } from '@/utils/imageUtils'

/**
 * Achica la foto y la sube a la carpeta del refugio.
 * @param {string} shelterId
 * @param {File} file
 * @returns {Promise<{imageStoragePath: string, imageUrl: string}>} Ruta en Storage y URL pública.
 */
export async function uploadPetImage(shelterId, file) {
  const image = await resizeImage(file)
  const imageStoragePath = `pets/${shelterId}/${crypto.randomUUID()}.jpg`
  const imageRef = ref(storage, imageStoragePath)

  await uploadBytes(imageRef, image, { contentType: 'image/jpeg' })
  const imageUrl = await getDownloadURL(imageRef)

  return { imageStoragePath, imageUrl }
}

/**
 * Borra una foto de Storage.
 * @param {string} imageStoragePath
 * @returns {Promise<void>}
 */
export function deletePetImage(imageStoragePath) {
  return deleteObject(ref(storage, imageStoragePath))
}
