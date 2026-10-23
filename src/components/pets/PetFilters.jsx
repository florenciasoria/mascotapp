import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { COLORS, SEXES, SIZES, SPECIES } from '@/utils/petOptions'
import { AGE_FILTER_OPTIONS } from '@/utils/petFilters'
import styles from './PetFilters.module.css'

// Agrega la opción "sin filtro" (valor vacío) al principio de una lista
const withAll = (label, options) => [{ value: '', label }, ...options]

/**
 * Filtros de la búsqueda de mascotas (CU002).
 * @param {object} props
 * @param {object} props.values - Filtros elegidos (todavía sin aplicar).
 * @param {string[]} props.neighborhoods - Barrios con mascotas disponibles.
 * @param {(event: Event) => void} props.onChange - Cambio en un filtro.
 * @param {() => void} props.onApply - Aplica los filtros elegidos.
 * @param {() => void} props.onClear - Limpia los filtros.
 * @param {boolean} props.canApply - Hay cambios para aplicar.
 * @param {boolean} props.canClear - Hay filtros para limpiar.
 * @param {string} [props.error] - Error de validación de los filtros.
 */
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
