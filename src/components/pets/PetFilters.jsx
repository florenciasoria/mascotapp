import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { COLORS, SEXES, SIZES, SPECIES } from '@/utils/petOptions'
import { AGE_FILTER_OPTIONS } from '@/utils/petFilters'
import styles from './PetFilters.module.css'

// Primera opción de cada lista: valor vacío = no filtra (el texto cambia según el filtro)
const withAll = (label, options) => [{ value: '', label }, ...options]

function PetFilters({
  values,
  neighborhoods,
  onChange,
  onApply,
  onClear,
  canApply,
  canClear,
  error,
}) {
  function handleSubmit(event) {
    event.preventDefault()
    onApply()
  }

  return (
    <Card
      as="form"
      role="search"
      aria-label="Filtros de búsqueda"
      className={styles.filters}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.grid}>
        <Select
          label="Especie"
          name="species"
          value={values.species}
          onChange={onChange}
          options={withAll('Todas', SPECIES)}
        />
        <Select
          label="Sexo"
          name="sex"
          value={values.sex}
          onChange={onChange}
          options={withAll('Todos', SEXES)}
        />
        <div className={styles.ageGroup}>
          <Select
            label="Edad desde"
            name="ageFrom"
            value={values.ageFrom}
            onChange={onChange}
            options={withAll('Sin mínimo', AGE_FILTER_OPTIONS)}
          />
          <Select
            label="Edad hasta"
            name="ageTo"
            value={values.ageTo}
            onChange={onChange}
            options={withAll('Sin máximo', AGE_FILTER_OPTIONS)}
          />
        </div>
        <Select
          label="Tamaño"
          name="size"
          value={values.size}
          onChange={onChange}
          options={withAll('Todos', SIZES)}
        />
        <Select
          label="Color"
          name="color"
          value={values.color}
          onChange={onChange}
          options={withAll('Todos', COLORS)}
        />
        <Select
          label="Ubicación"
          name="neighborhood"
          value={values.neighborhood}
          onChange={onChange}
          options={withAll('Todas', neighborhoods)}
        />
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClear} disabled={!canClear}>
          Limpiar filtros
        </Button>
        <Button type="submit" disabled={!canApply}>
          Aplicar
        </Button>
      </div>
    </Card>
  )
}

export default PetFilters
