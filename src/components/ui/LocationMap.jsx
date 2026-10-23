import styles from './LocationMap.module.css'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * Mapa de Google (Maps Embed API) centrado en una dirección.
 * @param {object} props
 * @param {string} props.address - Dirección a mostrar.
 * @param {string} props.title - Título accesible del mapa.
 */
function LocationMap({ address, title }) {
  const params = new URLSearchParams({
    key: MAPS_API_KEY,
    q: address,
    language: 'es',
    region: 'AR',
  })

  return (
    <iframe
      className={styles.map}
      title={title}
      src={`https://www.google.com/maps/embed/v1/place?${params}`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  )
}

export default LocationMap
