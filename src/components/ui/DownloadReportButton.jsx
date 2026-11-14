import { useState } from 'react'
import Button from './Button'
import ResultDialog from './ResultDialog'
import { downloadReport } from '@/utils/pdfReport'

/**
 * Botón que genera y descarga un reporte en PDF. Mientras genera, queda deshabilitado.
 * @param {object} props
 * @param {() => object} props.getReport - Devuelve los datos del reporte en el momento del clic
 *   (los que recibe downloadReport en utils/pdfReport).
 */
function DownloadReportButton({ getReport }) {
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
        variant="outline"
        onClick={handleClick}
        disabled={isGenerating}
        aria-busy={isGenerating || undefined}
      >
        {isGenerating ? 'Generando…' : 'Descargar reporte (PDF)'}
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
