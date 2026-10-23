import Card from '@/components/ui/Card'
import { formatAge } from '@/utils/petOptions'
import styles from './PetCard.module.css'

/**
 * Tarjeta de una mascota.
 * @param {object} props
 * @param {object} props.pet - Mascota a mostrar.
 * @param {boolean} [props.muted] - Muestra la foto en escala de grises (mascota no disponible).
 * @param {React.ReactNode} [props.children] - Estado y acciones que agrega cada pantalla.
 */
function PetCard({ pet, muted = false, children }) {
  const titleId = `pet-${pet.id}`

  return (
    <Card
      as="article"
      className={muted ? `${styles.card} ${styles.muted}` : styles.card}
      aria-labelledby={titleId}
    >
      <img
        src={pet.imageUrl}
        alt={`Foto de ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`}
        className={styles.image}
        loading="lazy"
      />
      <div>
        <h3 id={titleId} className={styles.name}>
          {pet.name}
        </h3>
        <ul className={styles.details}>
          <li>
            {pet.species} · {pet.sex}
          </li>
          <li>
            {formatAge(pet.ageValue, pet.ageUnit)} · {pet.size}
          </li>
          <li>{pet.neighborhood}</li>
        </ul>
      </div>
      {children && <div className={styles.footer}>{children}</div>}
    </Card>
  )
}

export default PetCard
