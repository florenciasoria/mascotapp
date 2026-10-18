import Card from '@/components/ui/Card'
import { formatAge } from '@/utils/petOptions'
import styles from './PetCard.module.css'

// Tarjeta de mascota reutilizable. Lo que va abajo (estado, botones)
// lo decide cada pantalla y se pasa como children.
// muted: se ve "apagada" (por ejemplo, mascota desactivada o adoptada).
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
