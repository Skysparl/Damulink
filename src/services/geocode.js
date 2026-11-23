import { COUNTIES } from '../utils/constants.js'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const cache = new Map()

export function findCounty(text) {
  if (!text) return ''

  const haystack = String(text).toLocaleLowerCase()
  return COUNTIES.find((county) => haystack.includes(county.toLowerCase())) || ''
}

export async function geocodeAppeal({ hospital, county }) {
  const searchTerm = [hospital, county, 'Kenya'].filter(Boolean).join(', ')
  if (cache.has(searchTerm)) return cache.get(searchTerm)

  const params = new URLSearchParams({
    q: searchTerm,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'ke',
  })

  try {
    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null

    const results = await response.json()
    const top = Array.isArray(results) ? results[0] : null
    if (!top) {
      cache.set(searchTerm, null)
      return null
    }

    const result = {
      lat: Number(top.lat),
      lon: Number(top.lon),
      county: findCounty(top.display_name) || county || '',
      label: top.display_name,
    }
    cache.set(searchTerm, result)
    return result
  } catch {
    return null
  }
}
