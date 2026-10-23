import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import DonationCard from '@/components/donations/DonationCard'
import { useAuth } from '@/hooks/useAuth'
import { getAdopterDonations } from '@/services/donationService'
import styles from './MyDonationsPage.module.css'

/** Donaciones realizadas por el adoptante. */
function MyDonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isActive = true

    getAdopterDonations(user.uid)
      .then((result) => isActive && setDonations(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  return (
    <>
      <PageHeader
        title="Mis donaciones"
        subtitle="Consultá tus donaciones y colaborá con un refugio."
      />

      <Card as="section" className={styles.cta} aria-labelledby="donate-title">
        <h2 id="donate-title" className={styles.ctaTitle}>
          ¿Querés colaborar con un refugio?
        </h2>
        <p className={styles.ctaText}>
          Realizá una donación para ayudar a las mascotas que esperan una familia.
        </p>
        <ButtonLink to="/adoptante/donaciones/nueva">Realizar donación</ButtonLink>
      </Card>

      <section aria-labelledby="donations-title">
        <h2 id="donations-title" className={styles.sectionTitle}>
          Donaciones realizadas
        </h2>

        {isLoading && <p role="status">Cargando donaciones…</p>}

        {loadError && (
          <p className={styles.error} role="alert">
            No pudimos cargar tus donaciones. Recargá la página para intentar de nuevo.
          </p>
        )}

        {!isLoading && !loadError && donations.length === 0 && (
          <p>Todavía no realizaste donaciones.</p>
        )}

        {donations.length > 0 && (
          <ul className={styles.grid}>
            {donations.map((donation) => (
              <li key={donation.id}>
                <DonationCard
                  donation={donation}
                  title={donation.shelterName}
                  subtitle={donation.neighborhood}
                  showCard
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}

export default MyDonationsPage
