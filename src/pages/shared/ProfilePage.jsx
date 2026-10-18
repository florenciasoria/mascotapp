import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ResultDialog from '@/components/ui/ResultDialog'
import { useAuth } from '@/hooks/useAuth'
import { getAuthErrorMessage, sendPasswordReset } from '@/services/authService'
import { updateUserProfile } from '@/services/userService'
import { syncShelterInfoInPets } from '@/services/petService'
import { syncShelterPublicProfile } from '@/services/shelterService'
import { focusFirstInvalidField } from '@/utils/forms'
import { NEIGHBORHOODS } from '@/utils/neighborhoods'
import { ROLE_LABELS, ROLES } from '@/utils/roles'
import { LIMITS, validateProfileForm } from '@/utils/validators'
import styles from './ProfilePage.module.css'

const HEADERS = {
  [ROLES.ADOPTER]: {
    title: 'Mi perfil',
    subtitle: 'Consultá y actualizá tu información personal.',
  },
  [ROLES.SHELTER]: {
    title: 'Mi refugio',
    subtitle: 'Consultá y actualizá la información de tu refugio.',
  },
  [ROLES.ADMIN]: {
    title: 'Mi perfil',
    subtitle: 'Consultá y actualizá la información de tu cuenta.',
  },
}

// Campos que cada rol puede editar (las reglas de Firestore validan lo mismo)
const EDITABLE_FIELDS = {
  [ROLES.ADOPTER]: ['name', 'phone', 'address'],
  [ROLES.SHELTER]: ['name', 'phone', 'address', 'neighborhood', 'about'],
  [ROLES.ADMIN]: [],
}

function getInitialValues(profile, fields) {
  return Object.fromEntries(fields.map((field) => [field, profile[field] ?? '']))
}

// Perfil compartido por los tres roles: cada uno ve y edita sus campos
function ProfilePage() {
  const { user, profile } = useAuth()
  const fields = EDITABLE_FIELDS[profile.role]
  const isShelter = profile.role === ROLES.SHELTER
  const { title, subtitle } = HEADERS[profile.role]

  const [values, setValues] = useState(() => getInitialValues(profile, fields))
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [dialog, setDialog] = useState(null)

  const hasChanges = fields.some((field) => values[field] !== (profile[field] ?? ''))

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  function handleCancel() {
    setValues(getInitialValues(profile, fields))
    setErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateProfileForm(values, profile.role)
    setErrors(validationErrors)
    if (focusFirstInvalidField(event.target, validationErrors)) {
      return
    }

    setIsSaving(true)
    try {
      await updateUserProfile(user.uid, values)
      // El refugio tiene sus datos copiados en sus mascotas y en su perfil público: los actualizamos
      if (isShelter) {
        await syncShelterInfoInPets(user.uid, {
          name: values.name.trim(),
          neighborhood: values.neighborhood,
          address: values.address.trim(),
        })
        await syncShelterPublicProfile(user.uid, {
          name: values.name.trim(),
          neighborhood: values.neighborhood,
          about: values.about.trim(),
        })
      }
      setDialog({
        type: 'success',
        title: '¡Datos actualizados!',
        message: 'Tu información se guardó correctamente.',
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos guardar los cambios. Intentá nuevamente.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePassword() {
    setIsSendingReset(true)
    try {
      await sendPasswordReset(user.email)
      setDialog({
        type: 'success',
        title: 'Revisá tu email',
        message: `Te enviamos un enlace a ${user.email} para que elijas una nueva contraseña.`,
      })
    } catch (error) {
      setDialog({ type: 'error', title: '¡Error!', message: getAuthErrorMessage(error) })
    } finally {
      setIsSendingReset(false)
    }
  }

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          {fields.includes('name') && (
            <Input
              label={isShelter ? 'Nombre del refugio' : 'Nombre y apellido'}
              name="name"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              autoComplete={isShelter ? 'organization' : 'name'}
              maxLength={LIMITS.name.max}
              required
            />
          )}
          <Input
            label="Correo electrónico"
            type="email"
            value={user.email}
            hint="El email no se puede modificar"
            readOnly
          />
          {fields.includes('phone') && (
            <Input
              label="Teléfono"
              type="tel"
              name="phone"
              value={values.phone}
              onChange={handleChange}
              error={errors.phone}
              autoComplete="tel"
              maxLength={LIMITS.phone.max}
              required
            />
          )}
          <Input label="Tipo de usuario" value={ROLE_LABELS[profile.role]} readOnly />
          {fields.includes('address') && (
            <Input
              label="Dirección"
              name="address"
              value={values.address}
              onChange={handleChange}
              error={errors.address}
              hint={isShelter ? 'Calle y número. Si es en GBA, agregá la localidad.' : undefined}
              autoComplete="street-address"
              maxLength={LIMITS.address.max}
              required
            />
          )}
          {isShelter && (
            <Select
              label="Barrio"
              name="neighborhood"
              value={values.neighborhood}
              onChange={handleChange}
              error={errors.neighborhood}
              options={NEIGHBORHOODS}
              placeholder="Elegí un barrio"
              required
            />
          )}
          {isShelter && (
            <div className={styles.fullWidth}>
              <Input
                label="Sobre el refugio"
                name="about"
                multiline
                value={values.about}
                onChange={handleChange}
                error={errors.about}
                maxLength={LIMITS.about.max}
                required
              />
            </div>
          )}
        </div>

        <div className={styles.passwordRow}>
          <span className={styles.passwordLabel}>Contraseña</span>
          <Button variant="link" onClick={handleChangePassword} isLoading={isSendingReset}>
            Cambiar contraseña
          </Button>
        </div>

        {fields.length > 0 && (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={handleCancel} disabled={!hasChanges || isSaving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving} disabled={!hasChanges}>
              Guardar
            </Button>
          </div>
        )}
      </form>

      <ResultDialog
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        type={dialog?.type}
        title={dialog?.title ?? ''}
        message={dialog?.message}
      />
    </>
  )
}

export default ProfilePage
