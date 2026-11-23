import { describe, expect, it, vi } from 'vitest'
import {
  addAppeal,
  editAppeal,
  fetchAppeal,
  fetchAppeals,
  pledgeUnits,
  removeAppeal,
  subscribeToAppeals,
} from '../services/appealService.js'
import { seedUser } from '../test/helpers.jsx'

const data = { patientName: 'Mary', hospital: 'KNH', county: 'Nairobi', bloodType: 'O+', units: 2 }

// Demo mode: the service delegates to the local storage backend.
describe('appealService in demo mode', () => {
  it('runs the full create, read, update, delete cycle', async () => {
    seedUser()
    const listener = vi.fn()
    const unsubscribe = subscribeToAppeals(listener)

    const created = await addAppeal(data)
    expect(created.status).toBe('open')
    expect(listener).toHaveBeenLastCalledWith([expect.objectContaining({ id: created.id })])

    expect(await fetchAppeals()).toHaveLength(1)
    expect((await fetchAppeal(created.id)).hospital).toBe('KNH')

    expect(await pledgeUnits(created.id, 2)).toMatchObject({ unitsPledged: 2, status: 'fulfilled' })
    expect((await editAppeal(created.id, { status: 'open' })).status).toBe('open')

    await removeAppeal(created.id)
    expect(await fetchAppeals()).toEqual([])
    expect(listener).toHaveBeenLastCalledWith([])
    unsubscribe()
  })
})
