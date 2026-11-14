import { useState } from 'react'
import Button from './Button'
import ResultDialog from './ResultDialog'
import { downloadReport } from '@/utils/pdfReport'

/**
 * Botón que genera y descarga un reporte en PDF. Mientras genera, queda deshabilitado.
 * @param {object} props
 * @param {() => object} props.getReport - Devuelve los datos del reporte en el momento del click
 *   (los que recibe downloadReport en utils/pdfReport).
 * @param {string} [props.label] - Texto del botón.
 * @param {'outline'|'primary'} [props.variant] - Estilo: con borde (por defecto, para no competir
 *   con la acción principal de la página) o relleno cuando es la acción principal.
 */
function DownloadReportButton({
  getReport,
  label = 'Descargar reporte (PDF)',
  variant = 'outline',
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasError, setHasError] = useState(false)

  async function handleClick() {
    setIsGenerating(true)
    try {
      await downloadReport(getReport())
    } catch {
      setHasError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={isGenerating}
        aria-busy={isGenerating || undefined}
      >
        {isGenerating ? 'Generando…' : label}
      </Button>

      <ResultDialog
        isOpen={hasError}
        onClose={() => setHasError(false)}
        type="error"
        title="¡Error!"
        message="No pudimos generar el reporte. Intentá nuevamente."
      />
    </>
  )
}

export default DownloadReportButton
