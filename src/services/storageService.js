// Servicio de archivos: el único lugar que usa Firebase Storage
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './firebase'
import { resizeImage } from '@/utils/imageUtils'

// Sube la foto (achicada) a la carpeta del refugio.
// Devuelve la ruta en Storage (para poder borrarla) y la URL para mostrarla.
export async function uploadPetImage(shelterId, file) {
  const image = await resizeImage(file)
  const imageStoragePath = `pets/${shelterId}/${crypto.randomUUID()}.jpg`
  const imageRef = ref(storage, imageStoragePath)

  await uploadBytes(imageRef, image, { contentType: 'image/jpeg' })
  const imageUrl = await getDownloadURL(imageRef)

  return { imageStoragePath, imageUrl }
}

export function deletePetImage(imageStoragePath) {
  return deleteObject(ref(storage, imageStoragePath))
}
