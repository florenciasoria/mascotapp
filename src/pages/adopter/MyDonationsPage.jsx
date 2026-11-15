import { useEffect, useRef, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import DownloadReportButton from '@/components/ui/DownloadReportButton'
import MonthlyChart from '@/components/charts/MonthlyChart'
import BarListChart from '@/components/charts/BarListChart'
import ToggleGroup from '@/components/ui/ToggleGroup'
import DonationCard from '@/components/donations/DonationCard'
import { useAuth } from '@/hooks/useAuth'
import { getAdopterDonations } from '@/services/donationService'
import { formatDate, groupByMonth, PERIOD_OPTIONS } from '@/utils/dates'
import { formatCurrency, sumByShelter } from '@/utils/donationOptions'
import dashboardStyles from '@/pages/shared/Dashboard.module.css'
import styles from './MyDonationsPage.module.css'

/** Donaciones realizadas por el adoptante. */
function MyDonationsPage() {
  const { user, profile } = useAuth()
  const [donations, setDonations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [donationMonths, setDonationMonths] = useState(6)
  const chartsRef = useRef(null)

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

  const totals = [
    {
      label: 'Total donado',
      value: formatCurrency(donations.reduce((sum, donation) => sum + donation.amount, 0)),
    },
    { label: 'Donaciones', value: donations.length },
    {
      label: 'Refugios ayudados',
      value: new Set(donations.map((donation) => donation.shelterId)).size,
    },
  ]

  const donationsByMonth = groupByMonth(donations, {
    months: donationMonths,
    getValue: (donation) => donation.amount,
  })

  const donationsByShelter = sumByShelter(donations).map((shelter) => ({
    label: shelter.shelterName,
    value: shelter.amount,
    detail: `${formatCurrency(shelter.amount)} · ${shelter.count === 1 ? '1 donación' : `${shelter.count} donaciones`}`,
  }))

  function getReport() {
    return {
      title: 'Mis donaciones',
      subtitle: `Adoptante: ${profile.name}`,
      totals,
      chartsContainer: chartsRef.current,
      tables: [
        {
          title: 'Donaciones realizadas',
          columns: ['Fecha', 'Refugio', 'Barrio', 'Importe'],
          rows: donations.map((donation) => [
            formatDate(donation.createdAt),
            donation.shelterName,
            donation.neighborhood,
            formatCurrency(donation.amount),
          ]),
        },
      ],
      fileName: `donaciones ${profile.name}`,
    }
  }

  return (
    <>
      <PageHeader
        title="Mis donaciones"
        subtitle="Consultá tus donaciones y colaborá con un refugio."
        actions={donations.length > 0 && <DownloadReportButton getReport={getReport} />}
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

      {donations.length > 0 && (
        <>
          <section aria-labelledby="totals-title">
            <h2 id="totals-title" className={dashboardStyles.sectionTitle}>
              Resumen
            </h2>
            <ul className={dashboardStyles.totals}>
              {totals.map((item) => (
                <li key={item.label}>
                  <Card className={dashboardStyles.total}>
                    <p className={dashboardStyles.totalLabel}>{item.label}</p>
                    <p className={dashboardStyles.totalValue}>{item.value}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="charts-title">
            <h2 id="charts-title" className={dashboardStyles.sectionTitle}>
              Gráficos
            </h2>
            <div className={dashboardStyles.charts} ref={chartsRef}>
              <div className={dashboardStyles.wide}>
                <MonthlyChart
                  title="Donado por mes"
                  variant="line"
                  data={donationsByMonth}
                  valueLabel="Donado"
                  formatValue={formatCurrency}
                  actions={
                    <ToggleGroup
                      label="Período"
                      name="donationPeriod"
                      value={String(donationMonths)}
                      onChange={(event) => setDonationMonths(Number(event.target.value))}
                      options={PERIOD_OPTIONS}
                    />
                  }
                />
              </div>
              <div className={dashboardStyles.wide}>
                <BarListChart title="Donado por refugio" data={donationsByShelter} />
              </div>
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="donations-title">
        <h2 id="donations-title" className={dashboardStyles.sectionTitle}>
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
