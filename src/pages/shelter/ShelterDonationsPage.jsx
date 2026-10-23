import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import DonationCard from '@/components/donations/DonationCard'
import { useAuth } from '@/hooks/useAuth'
import { getShelterDonations, getShelterDonationSummary } from '@/services/donationService'
import { formatCurrency } from '@/utils/donationOptions'
import styles from './ShelterDonationsPage.module.css'

/** Donaciones recibidas por el refugio: total, cantidad y detalle. */
function ShelterDonationsPage() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.all([getShelterDonations(user.uid), getShelterDonationSummary(user.uid)])
      .then(([list, totals]) => {
        if (!isActive) return
        setDonations(list)
        setSummary(totals)
      })
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  return (
    <>
      <PageHeader
        title="Donaciones recibidas"
        subtitle="Las donaciones que los adoptantes hicieron a tu refugio."
      />

      {isLoading && <p role="status">Cargando donaciones…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar las donaciones. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && donations.length === 0 && (
        <p>Todavía no recibiste donaciones.</p>
      )}

      {donations.length > 0 && summary && (
        <>
          <div className={styles.summary}>
            <Card className={styles.stat}>
              <p className={styles.statLabel}>Total recibido</p>
              <p className={styles.statValue}>{formatCurrency(summary.amount)}</p>
            </Card>
            <Card className={styles.stat}>
              <p className={styles.statLabel}>Donaciones</p>
              <p className={styles.statValue}>{summary.total}</p>
            </Card>
          </div>

          <section aria-labelledby="donations-title">
            <h2 id="donations-title" className={styles.sectionTitle}>
              Detalle
            </h2>
            <ul className={styles.grid}>
              {donations.map((donation) => (
                <li key={donation.id}>
                  <DonationCard donation={donation} title={donation.adopterName} />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}

export default ShelterDonationsPage
