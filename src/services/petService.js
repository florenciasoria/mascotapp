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
import { deletePetImage, uploadPetImage } from './storageService'
import { sortByNewest } from '@/utils/dates'
import { PET_STATUS, toMonths } from '@/utils/petOptions'

const petsCollection = collection(db, 'pets')

// Convierte los datos del formulario en los campos que se guardan
function buildPetFields({
  name,
  species,
  breed,
  sex,
  ageValue,
  ageUnit,
  size,
  color,
  description,
}) {
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

// Registra una mascota. Primero sube la foto y después guarda los datos.
// El nombre, el barrio y la dirección del refugio se copian en la mascota (desnormalización):
// así el adoptante puede verlos y filtrar por barrio sin leer el perfil del refugio.
export async function createPet(shelterId, shelterProfile, petData, imageFile) {
  const image = await uploadPetImage(shelterId, imageFile)

  try {
    return await addDoc(petsCollection, {
      ...buildPetFields(petData),
      ...image,
      shelterId,
      shelterName: shelterProfile.name,
      neighborhood: shelterProfile.neighborhood,
      shelterAddress: shelterProfile.address,
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

// Activar o desactivar una mascota (disponible / no disponible)
export function setPetStatus(petId, status) {
  return updateDoc(doc(db, 'pets', petId), { status, updatedAt: serverTimestamp() })
}

// Una mascota por su ID (o null si no existe o las reglas no dejan leerla)
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
  const snapshot = await getDocs(query(petsCollection, where('status', '==', PET_STATUS.AVAILABLE)))
  return sortByNewest(snapshot.docs.map(toPet))
}

// Cuando el refugio edita su perfil, actualiza su nombre, barrio y dirección en sus mascotas.
// Las adoptadas no se tocan: quedan como registro de dónde estaban.
export async function syncShelterInfoInPets(shelterId, { name, neighborhood, address }) {
  const snapshot = await getDocs(query(petsCollection, where('shelterId', '==', shelterId)))
  const batch = writeBatch(db)

  snapshot.docs
    .filter((petDoc) => petDoc.data().status !== PET_STATUS.ADOPTED)
    .forEach((petDoc) => {
      batch.update(petDoc.ref, {
        shelterName: name,
        neighborhood,
        shelterAddress: address,
        updatedAt: serverTimestamp(),
      })
    })

  return batch.commit()
}

// Pausa todas las mascotas disponibles de un refugio (lo usa el admin al desactivarlo)
export async function pauseShelterPets(shelterId) {
  const snapshot = await getDocs(
    query(
      petsCollection,
      where('shelterId', '==', shelterId),
      where('status', '==', PET_STATUS.AVAILABLE),
    ),
  )
  const batch = writeBatch(db)
  snapshot.docs.forEach((petDoc) => {
    batch.update(petDoc.ref, { status: PET_STATUS.UNAVAILABLE, updatedAt: serverTimestamp() })
  })
  return batch.commit()
}
