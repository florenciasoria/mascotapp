// Servicio de mascotas: el único lugar que lee y escribe la colección "pets"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'
import { PET_STATUS, toMonths } from '@/utils/petOptions'
import { deletePetImage, uploadPetImage } from './storageService'

const petsCollection = collection(db, 'pets')

// Convierte los datos del formulario en los campos que se guardan
function buildPetFields({ name, species, breed, sex, ageValue, ageUnit, size, color, description }) {
  const age = Number(ageValue)
  return {
    name: name.trim(),
    species,
    breed: breed.trim(),
    sex,
    ageValue: age,
    ageUnit,
    ageInMonths: toMonths(age, ageUnit),
    size,
    color,
    description: description.trim(),
  }
}

// Pasa un documento de Firestore a un objeto con su id
function toPet(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

// Ordena de la más nueva a la más vieja (se ordena acá para no necesitar un índice compuesto)
function sortByNewest(pets) {
  return pets.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
}

// El nombre y el barrio del refugio se copian en la mascota (desnormalización):
// así el adoptante puede ver y filtrar por barrio sin leer el perfil del refugio.
// Primero sube la foto y después guarda la mascota.
// El nombre y el barrio del refugio se copian en la mascota (desnormalización).
export async function createPet(shelterId, shelterProfile, petData, imageFile) {
  const image = await uploadPetImage(shelterId, imageFile)

  try {
    return await addDoc(petsCollection, {
      ...buildPetFields(petData),
      ...image,
      shelterId,
      shelterName: shelterProfile.name,
      neighborhood: shelterProfile.neighborhood,
      status: PET_STATUS.AVAILABLE,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    // Si no se pudo guardar la mascota, borramos la foto para no dejarla huérfana
    await deletePetImage(image.imageStoragePath).catch(() => {})
    throw error
  }
}

// Si hay foto nueva: se sube, se guarda la mascota y recién ahí se borra la vieja
export async function updatePet(pet, petData, newImageFile) {
  const newImage = newImageFile ? await uploadPetImage(pet.shelterId, newImageFile) : null

  try {
    await updateDoc(doc(db, 'pets', pet.id), {
      ...buildPetFields(petData),
      ...newImage,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    if (newImage) {
      await deletePetImage(newImage.imageStoragePath).catch(() => {})
    }
    throw error
  }

  // La foto anterior ya no se usa. Si falla el borrado, la mascota no se ve afectada.
  if (newImage && pet.imageStoragePath) {
    await deletePetImage(pet.imageStoragePath).catch(() => {})
  }
}

export function setPetStatus(petId, status) {
  return updateDoc(doc(db, 'pets', petId), { status, updatedAt: serverTimestamp() })
}

export async function getPet(petId) {
  const snapshot = await getDoc(doc(db, 'pets', petId))
  return snapshot.exists() ? toPet(snapshot) : null
}

// Mascotas de un refugio (todas, en cualquier estado)
export async function getShelterPets(shelterId) {
  const snapshot = await getDocs(query(petsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toPet))
}

// Mascotas que se pueden adoptar (los filtros se aplican después, en el navegador)
export async function getAvailablePets() {
  const snapshot = await getDocs(
    query(petsCollection, where('status', '==', PET_STATUS.AVAILABLE)),
  )
  return sortByNewest(snapshot.docs.map(toPet))
}

// Mantiene actualizados el nombre y el barrio del refugio copiados en sus mascotas.
// Las adoptadas no se tocan: quedan como registro de dónde estaban.
export async function syncShelterInfoInPets(shelterId, { name, neighborhood }) {
  const snapshot = await getDocs(query(petsCollection, where('shelterId', '==', shelterId)))
  const batch = writeBatch(db)

  snapshot.docs
    .filter((petDoc) => petDoc.data().status !== PET_STATUS.ADOPTED)
    .forEach((petDoc) => {
      batch.update(petDoc.ref, {
        shelterName: name,
        neighborhood,
        updatedAt: serverTimestamp(),
      })
    })

  return batch.commit()
}