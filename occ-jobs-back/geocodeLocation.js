const axios = require('axios')
const geocodeCache = {};

// Función para limpiar y normalizar ubicaciones
function cleanLocation(ubicacion) {
  if (!ubicacion || ubicacion === "No disponible") {
    return null;
  }

  let cleaned = ubicacion
    // Remover texto extra común
    .replace(/^en\s*/i, '') // "enCiudad de México" -> "Ciudad de México"
    .replace(/\s*,\s*$/, '') // "Santa Fe," -> "Santa Fe"
    .replace(/\s+/g, ' ') // Espacios múltiples
    .trim();

  // Si está vacío después de limpiar
  if (!cleaned) {
    return null;
  }

  // Mapear ubicaciones comunes a versiones más geocodificables
  const locationMappings = {
    'CDMX': 'Ciudad de México, México',
    'Ciudad de México': 'Ciudad de México, México',
    'Santa Fe': 'Santa Fe, Ciudad de México, México',
    'Polanco': 'Polanco, Ciudad de México, México',
    'Roma Norte': 'Roma Norte, Ciudad de México, México',
    'Condesa': 'Condesa, Ciudad de México, México',
    'Guadalajara': 'Guadalajara, Jalisco, México',
    'Monterrey': 'Monterrey, Nuevo León, México',
    'MTY': 'Monterrey, Nuevo León, México',
    'GDL': 'Guadalajara, Jalisco, México',
    'QTO': 'Querétaro, Querétaro, México',
    'Querétaro': 'Querétaro, Querétaro, México',
    'Tijuana': 'Tijuana, Baja California, México',
    'Puebla': 'Puebla, Puebla, México'
  };

  // Buscar mapeo exacto
  if (locationMappings[cleaned]) {
    return locationMappings[cleaned];
  }

  // Buscar mapeo parcial
  for (const [key, value] of Object.entries(locationMappings)) {
    if (cleaned.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Si no encuentra mapeo, agregar ", México" si no lo tiene
  if (!cleaned.toLowerCase().includes('méxico') && !cleaned.toLowerCase().includes('mexico')) {
    cleaned += ', México';
  }

  return cleaned;
}

async function geocodeLocation(ubicacion) {
  // Limpiar la ubicación
  const cleanedLocation = cleanLocation(ubicacion);
  
  if (!cleanedLocation) {
    console.log(`    ⚠️ Ubicación no válida: "${ubicacion}"`);
    return null;
  }

  // Verificar cache
  if (geocodeCache[cleanedLocation]) {
    console.log(`    💾 Cache hit para: "${cleanedLocation}"`);
    return geocodeCache[cleanedLocation];
  }

  console.log(`    🔍 Geocodificando: "${ubicacion}" -> "${cleanedLocation}"`);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cleanedLocation
  )}&countrycodes=mx&limit=1`;

  try {
    const response = await axios.get(url, {
      headers: { 
        "User-Agent": "occ-jobs-scraper-app",
        "Accept": "application/json"
      },
      timeout: 10000 // 10 segundos timeout
    });

    const data = response.data;

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const coords = { 
        lat: parseFloat(lat), 
        lng: parseFloat(lon) 
      };
      
      // Validar que las coordenadas estén en México (aproximadamente)
      if (coords.lat >= 14.5 && coords.lat <= 32.7 && coords.lng >= -118.4 && coords.lng <= -86.7) {
        geocodeCache[cleanedLocation] = coords;
        console.log(`    ✅ Coordenadas obtenidas: ${coords.lat}, ${coords.lng}`);
        return coords;
      } else {
        console.log(`    ❌ Coordenadas fuera de México: ${coords.lat}, ${coords.lng}`);
        return null;
      }
    }

    console.log(`    ❌ No se encontraron resultados para: "${cleanedLocation}"`);
    return null;
  } catch (error) {
    console.error(`    ❌ Error al geocodificar "${cleanedLocation}":`, error.message);
    return null;
  }
}

module.exports = { geocodeLocation };