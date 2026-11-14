import { normalizeText } from './text'

// Medidas en milímetros (hoja A4 vertical: 210 × 297) y colores de la app
const MARGIN = 15
// Alto aproximado de una fila de tabla con letra de 9 puntos, y del título de cada tabla
const TABLE_ROW_HEIGHT = 7.5
const TABLE_TITLE_HEIGHT = 7
const COLORS = {
  brand: '#c0808f',
  text: '#6b625e',
  soft: '#776d68',
  border: '#d9d9d9',
  headFill: '#f7f4ed',
}

/** Texto apto para nombre de archivo: "Panel Hogar Bigotes" → "panel-hogar-bigotes". */
function toSlug(text) {
  return normalizeText(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Genera y descarga un reporte en PDF (A4 vertical) con encabezado, totales, gráficos y tablas.
 * Las librerías se cargan recién al generarlo, para no agrandar la carga inicial de la app.
 * @param {object} report
 * @param {string} report.title - Título del reporte (por ejemplo, "Panel de actividad").
 * @param {string} report.subtitle - De quién es (por ejemplo, "Refugio: Hogar Bigotes").
 * @param {{label: string, value: string|number}[]} report.totals - Totales del resumen.
 * @param {HTMLElement|null} [report.chartsContainer] - Bloque de gráficos que se captura como imagen.
 *   Lo marcado con data-pdf-ignore (por ejemplo, el selector de período) queda afuera.
 * @param {{title: string, columns: string[], rows: (string|number)[][]}[]} [report.tables] - Tablas de detalle.
 * @param {string} report.fileName - Nombre base del archivo; se le agregan "mascotapp-" y la fecha.
 * @returns {Promise<void>}
 */
export async function downloadReport({
  title,
  subtitle,
  totals,
  chartsContainer,
  tables = [],
  fileName,
}) {
  const [{ jsPDF }, { default: autoTable }, { toJpeg }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
    import('html-to-image'),
  ])

  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - MARGIN * 2
  const tableOptions = {
    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, textColor: COLORS.text, lineColor: COLORS.border },
    headStyles: { fillColor: COLORS.headFill, textColor: COLORS.text, fontStyle: 'bold' },
  }
  let y = MARGIN

  // Pasa a una hoja nueva si lo que sigue no entra en la actual
  function ensureSpace(height) {
    if (y + height > pageHeight - MARGIN) {
      pdf.addPage()
      y = MARGIN
    }
  }

  // Encabezado
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(COLORS.brand)
  pdf.text('MascotApp', MARGIN, y + 4)
  pdf.setFontSize(18)
  pdf.setTextColor(COLORS.text)
  pdf.text(title, MARGIN, y + 13)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(COLORS.soft)
  pdf.text(subtitle, MARGIN, y + 20)
  const generatedAt = new Date().toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
  pdf.text(`Generado el ${generatedAt}`, MARGIN, y + 25)
  y += 33

  // Totales: los nombres arriba y los valores abajo
  autoTable(pdf, {
    ...tableOptions,
    startY: y,
    head: [totals.map((total) => total.label)],
    body: [totals.map((total) => String(total.value))],
    bodyStyles: { fontSize: 12, fontStyle: 'bold' },
  })
  y = pdf.lastAutoTable.finalY + 8

  // Gráficos: una sola imagen, con la misma disposición que en pantalla
  if (chartsContainer) {
    // JPEG en vez de PNG: jsPDF guarda el PNG sin comprimir y el archivo pesaba varios MB
    const image = await toJpeg(chartsContainer, {
      quality: 0.85,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      filter: (node) => !node.hasAttribute?.('data-pdf-ignore'),
    })
    // Mantiene la proporción y achica la imagen si es más alta que la hoja
    const ratio = chartsContainer.offsetHeight / chartsContainer.offsetWidth
    const imageHeight = Math.min(contentWidth * ratio, pageHeight - MARGIN * 2)
    const imageWidth = imageHeight / ratio
    ensureSpace(imageHeight)
    pdf.addImage(image, 'JPEG', MARGIN, y, imageWidth, imageHeight, undefined, 'FAST')
    y += imageHeight + 8
  }

  // Tablas de detalle: si una tabla no entra en lo que queda de la hoja, pasa entera a la siguiente.
  // Si es más larga que una hoja, se corta y autoTable repite el encabezado en cada página.
  tables.forEach((table) => {
    const rowCount = Math.max(table.rows.length, 1) + 1 // filas + encabezado
    const tableHeight = TABLE_TITLE_HEIGHT + rowCount * TABLE_ROW_HEIGHT
    const fitsInOnePage = tableHeight <= pageHeight - MARGIN * 2
    ensureSpace(fitsInOnePage ? tableHeight : TABLE_TITLE_HEIGHT + 3 * TABLE_ROW_HEIGHT)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(COLORS.text)
    pdf.text(table.title, MARGIN, y + 4)
    autoTable(pdf, {
      ...tableOptions,
      startY: y + TABLE_TITLE_HEIGHT,
      showHead: 'everyPage',
      head: [table.columns],
      body:
        table.rows.length > 0
          ? table.rows
          : [[{ content: 'Sin registros', colSpan: table.columns.length }]],
    })
    y = pdf.lastAutoTable.finalY + 10
  })

  // Pie de página con la numeración
  const pageCount = pdf.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page)
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(COLORS.soft)
    pdf.text(`Página ${page} de ${pageCount}`, pageWidth - MARGIN, pageHeight - 8, {
      align: 'right',
    })
  }

  // Fecha local AAAA-MM-DD (toISOString usa la hora UTC y de noche daría el día siguiente)
  const date = new Date().toLocaleDateString('en-CA')
  pdf.save(`mascotapp-${toSlug(fileName)}-${date}.pdf`)
}
