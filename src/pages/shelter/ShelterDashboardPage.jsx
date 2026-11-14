import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import DonutChart from '@/components/charts/DonutChart'
import MonthlyChart from '@/components/charts/MonthlyChart'
import ToggleGroup from '@/components/ui/ToggleGroup'
import { useAuth } from '@/hooks/useAuth'
import { getShelterAdoptions } from '@/services/adoptionService'
import { getShelterDonations } from '@/services/donationService'
import { getShelterPets } from '@/services/petService'
import { CHART_COLORS } from '@/utils/chartColors'
import { groupByMonth, PERIOD_OPTIONS } from '@/utils/dates'
import { formatCurrency } from '@/utils/donationOptions'
import { PET_STATUS, PET_STATUS_LABELS } from '@/utils/petOptions'
import styles from '@/pages/shared/Dashboard.module.css'

/** Panel de actividad del refugio: donaciones recibidas, mascotas y adopciones. */
function ShelterDashboardPage() {
  const { user } = useAuth()
  const [activity, setActivity] = useState(null) // { donations, pets, adoptions }
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [donationMonths, setDonationMonths] = useState(6)
  const [adoptionMonths, setAdoptionMonths] = useState(6)

  useEffect(() => {
    let isActive = true

    Promise.all([
      getShelterDonations(user.uid),
      getShelterPets(user.uid),
      getShelterAdoptions(user.uid),
    ])
      .then(([donations, pets, adoptions]) => {
        if (isActive) setActivity({ donations, pets, adoptions })
      })
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  const header = (
    <PageHeader
      title="Panel de actividad"
      subtitle="Seguí las donaciones que recibís, el estado de tus mascotas y las adopciones."
    />
  )

  if (isLoading) {
    return (
      <>
        {header}
        <p role="status">Cargando panel…</p>
      </>
    )
  }

  if (loadError) {
    return (
      <>
        {header}
        <p className={styles.error} role="alert">
          No pudimos cargar el panel. Recargá la página para intentar de nuevo.
        </p>
      </>
    )
  }

  const { donations, pets, adoptions } = activity
  const countPets = (status) => pets.filter((pet) => pet.status === status).length
  const donationsByMonth = groupByMonth(donations, {
    months: donationMonths,
    getValue: (donation) => donation.amount,
  })
  const petsData = [
    { status: PET_STATUS.AVAILABLE, color: CHART_COLORS.green },
    { status: PET_STATUS.UNAVAILABLE, color: CHART_COLORS.pink },
    { status: PET_STATUS.ADOPTED, color: CHART_COLORS.blue },
  ].map(({ status, color }) => ({
    label: PET_STATUS_LABELS[status],
    value: countPets(status),
    color,
  }))
  const adoptionsByMonth = groupByMonth(adoptions, {
    months: adoptionMonths,
    dateField: 'resolvedAt',
  })

  const totals = [
    {
      label: 'Total recibido',
      value: formatCurrency(donations.reduce((sum, donation) => sum + donation.amount, 0)),
    },
    { label: 'Donaciones', value: donations.length },
    { label: 'Mascotas adoptadas', value: countPets(PET_STATUS.ADOPTED) },
    { label: 'Mascotas disponibles', value: countPets(PET_STATUS.AVAILABLE) },
  ]

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


      <section aria-labelledby="evolution-title">
        <h2 id="evolution-title" className={styles.sectionTitle}>
          Gráficos
        </h2>
        <div className={styles.charts}>
          <div className={styles.wide}>
            <MonthlyChart
              title="Recibido por mes"
              variant="line"
              data={donationsByMonth}
              valueLabel="Recibido"
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
          <DonutChart title="Mascotas por estado" data={petsData} />
          <MonthlyChart
            title="Adopciones por mes"
            data={adoptionsByMonth}
            valueLabel="Adopciones"
            actions={
              <ToggleGroup
                label="Período"
                name="adoptionPeriod"
                value={String(adoptionMonths)}
                onChange={(event) => setAdoptionMonths(Number(event.target.value))}
                options={PERIOD_OPTIONS}
              />
            }
          />
        </div>
      </section>
    </>
  )
}

export default ShelterDashboardPage
