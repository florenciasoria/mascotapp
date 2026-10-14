import styles from './RequestAnswers.module.css'

function yesNo(value) {
  return value ? 'Sí' : 'No'
}

// Respuestas del formulario de solicitud, solo lectura.
// La usan el adoptante (ver su solicitud) y el refugio (revisarla antes de decidir).
// Las preguntas de seguimiento se muestran solo si respondió "Sí".
function RequestAnswers({ answers }) {
  return (
    <dl className={styles.answers}>
      <div>
        <dt>Tipo de vivienda</dt>
        <dd>{answers.housingType}</dd>
      </div>
      <div>
        <dt>Horas que pasaría solo</dt>
        <dd>{answers.hoursAlone}</dd>
      </div>
      <div className={styles.fullWidth}>
        <dt>Quiénes viven en el hogar</dt>
        <dd>{answers.householdMembers}</dd>
      </div>

      <div>
        <dt>¿Tiene patio o balcón?</dt>
        <dd>{yesNo(answers.hasYard)}</dd>
      </div>
      {answers.hasYard && (
        <div>
          <dt>¿Está cerrado o tiene red de protección?</dt>
          <dd>{yesNo(answers.hasSafetyNet)}</dd>
        </div>
      )}

      <div>
        <dt>¿Tiene otras mascotas?</dt>
        <dd>{yesNo(answers.hasOtherPets)}</dd>
      </div>
      {answers.hasOtherPets && (
        <div>
          <dt>¿Qué mascotas tiene?</dt>
          <dd>{answers.otherPetsDetail}</dd>
        </div>
      )}

      <div>
        <dt>¿Tuvo mascotas antes?</dt>
        <dd>{yesNo(answers.hasExperience)}</dd>
      </div>
      {answers.hasExperience && (
        <div>
          <dt>Años de experiencia</dt>
          <dd>{answers.experienceYears}</dd>
        </div>
      )}

      <div className={styles.fullWidth}>
        <dt>Sobre el adoptante</dt>
        <dd className={styles.longText}>{answers.aboutAdopter}</dd>
      </div>
      <div className={styles.fullWidth}>
        <dt>Por qué quiere adoptar</dt>
        <dd className={styles.longText}>{answers.motivation}</dd>
      </div>
    </dl>
  )
}

export default RequestAnswers
