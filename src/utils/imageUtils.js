// Achica una imagen en el navegador antes de subirla: lado mayor de hasta maxSize px,
// formato JPEG. Una foto de celular de 4 MB queda en ~200 KB.
export async function resizeImage(file, maxSize = 1200, quality = 0.8) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)

  const context = canvas.getContext('2d')
  context.fillStyle = '#ffffff' // fondo blanco para PNG con transparencia
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))),
      'image/jpeg',
      quality,
    )
  })
}
