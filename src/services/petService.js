// Mascotas (colección "pets").
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

/**
 * Convierte los valores del formulario en los campos que se guardan.
 * @param {object} values - Valores del formulario.
 * @returns {object}
 */
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

/** Convierte un documento de Firestore en un objeto con su id. */
function toPet(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Registra una mascota: sube la foto y guarda los datos. Si falla el guardado, borra la foto.
 * Copia nombre, barrio y dirección del refugio en la mascota, para mostrarlos y filtrar
 * sin leer el perfil del refugio.
 * @param {string} shelterId
 * @param {object} shelterProfile - Perfil del refugio.
 * @param {object} petData - Valores del formulario.
 * @param {File} imageFile - Foto.
 * @returns {Promise<object>}
 */
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
    // Si falla el guardado, se borra la foto para no dejarla huérfana
    await deletePetImage(image.imageStoragePath).catch(() => {})
    throw error
  }
}

/**
 * Edita una mascota. Con foto nueva: la sube, guarda los datos y después borra la anterior.
 * @param {object} pet - Mascota actual.
 * @param {object} petData - Valores del formulario.
 * @param {File|null} newImageFile - Foto nueva, si se cambió.
 * @returns {Promise<void>}
 */
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

  // Si falla el borrado de la foto anterior, la mascota no se ve afectada
  if (newImage && pet.imageStoragePath) {
    await deletePetImage(pet.imageStoragePath).catch(() => {})
  }
}

/**
 * Activa o desactiva una mascota.
 * @param {string} petId
 * @param {string} status - "disponible" o "no_disponible".
 * @returns {Promise<void>}
 */
export function setPetStatus(petId, status) {
  return updateDoc(doc(db, 'pets', petId), { status, updatedAt: serverTimestamp() })
}

/**
 * Una mascota por su ID.
 * @param {string} petId
 * @returns {Promise<object|null>} La mascota, o null si no existe.
 */
export async function getPet(petId) {
  const snapshot = await getDoc(doc(db, 'pets', petId))
  return snapshot.exists() ? toPet(snapshot) : null
}

/**
 * Mascotas de un refugio, en cualquier estado.
 * @param {string} shelterId
 * @returns {Promise<object[]>}
 */
export async function getShelterPets(shelterId) {
  const snapshot = await getDocs(query(petsCollection, where('shelterId', '==', shelterId)))
  return sortByNewest(snapshot.docs.map(toPet))
}

/**
 * Mascotas disponibles para adopción (los filtros se aplican en el navegador).
 * @returns {Promise<object[]>}
 */
export async function getAvailablePets() {
  const snapshot = await getDocs(query(petsCollection, where('status', '==', PET_STATUS.AVAILABLE)))
  return sortByNewest(snapshot.docs.map(toPet))
}

/**
 * Actualiza el nombre, el barrio y la dirección del refugio en sus mascotas (escritura en lote).
 * Las adoptadas no se modifican.
 * @param {string} shelterId
 * @param {{name: string, neighborhood: string, address: string}} info
 * @returns {Promise<void>}
 */
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

/**
 * Pasa a "no disponible" todas las mascotas disponibles de un refugio (al desactivarlo).
 * @param {string} shelterId
 * @returns {Promise<void>}
 */
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
