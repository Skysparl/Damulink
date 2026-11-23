import { describe, expect, it, vi } from 'vitest'
import { findCounty, geocodeAppeal } from '../services/geocode.js'

function mockFetch(response) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(response)
}

describe('findCounty', () => {
  it('finds a county name inside an address', () => {
    expect(findCounty('Moi Teaching Hospital, Eldoret, Uasin Gishu, Kenya')).toBe('Uasin Gishu')
    expect(findCounty('Somewhere else')).toBe('')
    expect(findCounty('')).toBe('')
  })
})

describe('geocodeAppeal (OpenStreetMap Nominatim)', () => {
  it('queries Nominatim for Kenya and returns coordinates', async () => {
    const fetchSpy = mockFetch(async () => ({
      ok: true,
      json: async () => [{ lat: '-1.30', lon: '36.80', display_name: 'KNH, Upper Hill, Nairobi, Kenya' }],
    }))
    const result = await geocodeAppeal({ hospital: 'KNH', county: 'Nairobi' })
    expect(result).toEqual({ lat: -1.3, lon: 36.8, county: 'Nairobi', label: 'KNH, Upper Hill, Nairobi, Kenya' })
    const url = fetchSpy.mock.calls[0][0]
    expect(url).toContain('https://nominatim.openstreetmap.org/search?')
    expect(url).toContain('countrycodes=ke')
    expect(url).toContain('q=KNH%2C+Nairobi%2C+Kenya')
  })

  it('caches results so the same place is only requested once', async () => {
    const fetchSpy = mockFetch(async () => ({
      ok: true,
      json: async () => [{ lat: '0.5', lon: '35.2', display_name: 'Unknown place' }],
    }))
    const first = await geocodeAppeal({ hospital: 'Cache Test Hospital', county: 'Nakuru' })
    const second = await geocodeAppeal({ hospital: 'Cache Test Hospital', county: 'Nakuru' })
    expect(first).toBe(second)
    expect(first.county).toBe('Nakuru')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('returns null for no results, HTTP errors and network failures', async () => {
    mockFetch(async () => ({ ok: true, json: async () => [] }))
    expect(await geocodeAppeal({ hospital: 'Nowhere Clinic' })).toBeNull()
    mockFetch(async () => ({ ok: false }))
    expect(await geocodeAppeal({ hospital: 'Error Clinic' })).toBeNull()
    mockFetch(async () => {
      throw new Error('offline')
    })
    expect(await geocodeAppeal({ hospital: 'Offline Clinic' })).toBeNull()
    mockFetch(async () => ({ ok: true, json: async () => ({}) }))
    expect(await geocodeAppeal({ hospital: 'Odd Response Clinic' })).toBeNull()
  })
})
