import { useEffect, useState } from 'react'
import StarDisplay from '@/components/ratings/StarDisplay'
import { getShelterRatings, getShelterRatingSummary } from '@/services/ratingService'
import { formatDate } from '@/utils/dates'
import styles from './ShelterRatings.module.css'

const MAX_OPINIONS = 3

// Calificaciones de un refugio para los adoptantes: promedio general y las opiniones más recientes.
// Por privacidad, de quien calificó se muestra solo el nombre de pila.
// Es información secundaria: si falla la carga, la sección simplemente no se muestra.
function ShelterRatings({ shelterId, compact = false }) {
  const [summary, setSummary] = useState(null)
  const [opinions, setOpinions] = useState([])

  useEffect(() => {
    let isActive = true

    Promise.all([
      getShelterRatingSummary(shelterId),
      compact ? Promise.resolve([]) : getShelterRatings(shelterId),])
      .then(([totals, ratings]) => {
        if (!isActive) return
        setSummary(totals)
        setOpinions(ratings.filter((rating) => rating.comment).slice(0, MAX_OPINIONS))
      })
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [shelterId, compact])

  if (!summary) return null

  // Versión compacta (por ejemplo, en la tarjeta de un refugio): solo el promedio y la cantidad
  if (compact) {
    return summary.total === 0 ? (
      <p className={styles.compactEmpty}>Sin calificaciones todavía</p>
    ) : (
      <p className={styles.summary}>
        <StarDisplay value={(summary.shelterAverage + summary.processAverage) / 2} showValue />
        <span className={styles.count}>
          · {summary.total === 1 ? '1 calificación' : `${summary.total} calificaciones`}
        </span>
      </p>
    )
  }

  return (
    <section aria-labelledby="shelter-ratings-title" className={styles.ratings}>
      <h3 id="shelter-ratings-title" className={styles.title}>
        Calificaciones de los adoptantes
      </h3>

      {summary.total === 0 ? (
        <p className={styles.empty}>Todavía no tiene calificaciones.</p>
      ) : (
        <>
          <p className={styles.summary}>
            {/* Promedio general: el promedio de los dos puntajes */}
            <StarDisplay value={(summary.shelterAverage + summary.processAverage) / 2} showValue />
            <span className={styles.count}>
              · {summary.total === 1 ? '1 calificación' : `${summary.total} calificaciones`}
            </span>
          </p>

          {opinions.length > 0 && (
            <ul className={styles.opinions}>
              {opinions.map((rating) => (
                <li key={rating.id}>
                  <blockquote className={styles.comment}>{rating.comment}</blockquote>
                  <p className={styles.author}>
                    — {rating.adopterName.split(' ')[0]}, {formatDate(rating.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default ShelterRatings
