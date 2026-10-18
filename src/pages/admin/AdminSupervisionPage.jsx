import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import DonutChart from '@/components/charts/DonutChart'
import MonthlyChart from '@/components/charts/MonthlyChart'
import { getDonationsByMonth, getPlatformStats } from '@/services/statsService'
import { CHART_COLORS } from '@/utils/chartColors'
import { formatCurrency } from '@/utils/donationOptions'
import { PET_STATUS, PET_STATUS_LABELS } from '@/utils/petOptions'
import { REQUEST_STATUS, REQUEST_STATUS_LABELS } from '@/utils/requestOptions'
import { ROLE_LABELS, ROLES } from '@/utils/roles'
import styles from './AdminSupervisionPage.module.css'

// Suma los valores de un objeto: { a: 2, b: 3 } → 5
function sumValues(counts) {
  return Object.values(counts).reduce((total, value) => total + value, 0)
}

function AdminSupervisionPage() {
  const [stats, setStats] = useState(null)
  const [donationsByMonth, setDonationsByMonth] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isActive = true

    Promise.all([getPlatformStats(), getDonationsByMonth()])
      .then(([platformStats, byMonth]) => {
        if (!isActive) return
        setStats(platformStats)
        setDonationsByMonth(byMonth)
      })
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [])

  const header = (
    <PageHeader
      title="Supervisión de MascotApp"
      subtitle="Consultá la información general y la actividad de la plataforma."
    />
  )

  if (isLoading) {
    return (
      <>
        {header}
        <p role="status">Cargando información…</p>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        {header}
        <p className={styles.error} role="alert">
          No pudimos cargar la información. Recargá la página para intentar de nuevo.
        </p>
      </>
    )
  }

  const { usersByRole, petsByStatus, requestsByStatus, donations } = stats

  const totals = [
    { label: 'Usuarios', value: sumValues(usersByRole) },
    { label: 'Mascotas', value: sumValues(petsByStatus) },
    { label: 'Solicitudes', value: sumValues(requestsByStatus) },
    { label: 'Adopciones', value: requestsByStatus[REQUEST_STATUS.ACCEPTED] },
    // Sin donaciones, sum() devuelve null: se muestra $ 0
    { label: 'Donaciones', value: formatCurrency(donations.amount ?? 0) },
  ]

  const requestsData = [
    { status: REQUEST_STATUS.PENDING, color: CHART_COLORS.gold },
    { status: REQUEST_STATUS.ACCEPTED, color: CHART_COLORS.green },
    { status: REQUEST_STATUS.REJECTED, color: CHART_COLORS.pink },
    { status: REQUEST_STATUS.CANCELLED, color: CHART_COLORS.blue },
  ].map(({ status, color }) => ({
    label: REQUEST_STATUS_LABELS[status],
    value: requestsByStatus[status],
    color,
  }))

  const petsData = [
    { status: PET_STATUS.AVAILABLE, color: CHART_COLORS.green },
    { status: PET_STATUS.UNAVAILABLE, color: CHART_COLORS.pink },
    { status: PET_STATUS.ADOPTED, color: CHART_COLORS.blue },
  ].map(({ status, color }) => ({
    label: PET_STATUS_LABELS[status],
    value: petsByStatus[status],
    color,
  }))

  const usersData = [
    { role: ROLES.ADOPTER, color: CHART_COLORS.pink },
    { role: ROLES.SHELTER, color: CHART_COLORS.green },
  ].map(({ role, color }) => ({
    label: ROLE_LABELS[role],
    value: usersByRole[role],
    color,
  }))

  return (
    <>
      {header}

      <section aria-labelledby="totals-title">
        <h2 id="totals-title" className={styles.sectionTitle}>
          Resumen
        </h2>
        <ul className={styles.totals}>
          {totals.map((item) => (
            <li key={item.label}>
              <Card className={styles.total}>
                <p className={styles.totalLabel}>{item.label}</p>
                <p className={styles.totalValue}>{item.value}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="charts-title">
        <h2 id="charts-title" className={styles.sectionTitle}>
          Gráficos
        </h2>
        <div className={styles.charts}>
          <DonutChart title="Solicitudes por estado" data={requestsData} />
          <DonutChart title="Mascotas por estado" data={petsData} />
          <DonutChart title="Usuarios por rol" data={usersData} />
          <div className={styles.wide}>
            <MonthlyChart
              title="Donaciones por mes"
              data={donationsByMonth}
              valueLabel="Donado"
              formatValue={formatCurrency}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default AdminSupervisionPage
