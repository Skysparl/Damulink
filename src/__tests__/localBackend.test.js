import { describe, expect, it, vi } from 'vitest'
import {
  createLocalAppeal,
  deleteLocalAppeal,
  getLocalAppeal,
  getLocalUser,
  listLocalAppeals,
  pledgeLocalUnits,
  signInLocal,
  signOutLocal,
  signUpLocal,
  subscribeLocalAppeals,
  subscribeLocalAuth,
  updateLocalAppeal,
} from '../services/localBackend.js'

const amina = { name: ' Amina ', email: 'Amina@Example.com ', password: 'secret123' }
const appealData = { patientName: 'Mary', hospital: 'KNH', county: 'Nairobi', bloodType: 'O+', units: 3 }

describe('local auth', () => {
  it('signs up, notifies listeners and keeps a session', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeLocalAuth(listener)
    expect(listener).toHaveBeenLastCalledWith(null)

    const account = signUpLocal(amina)
    expect(account).toMatchObject({ name: 'Amina', email: 'amina@example.com' })
    expect(account).not.toHaveProperty('password')
    expect(listener).toHaveBeenLastCalledWith(account)
    expect(getLocalUser()).toEqual(account)
    unsubscribe()
  })

  it('rejects duplicate emails', () => {
    signUpLocal(amina)
    expect(() => signUpLocal(amina)).toThrow('That email is already registered')
  })

  it('signs in with the right password only, and signs out', () => {
    signUpLocal(amina)
    signOutLocal()
    expect(getLocalUser()).toBeNull()
    expect(() => signInLocal({ email: 'amina@example.com', password: 'wrong' })).toThrow(
      'Wrong email or password',
    )
    expect(signInLocal({ email: ' AMINA@example.com', password: 'secret123' }).name).toBe('Amina')
  })

  it('falls back when stored JSON is corrupt', () => {
    localStorage.setItem('damulink.session', '{bad json')
    expect(getLocalUser()).toBeNull()
  })
})

describe('local appeals', () => {
  it('requires a signed-in user to create', () => {
    expect(() => createLocalAppeal(appealData)).toThrow('You must be signed in to post an appeal')
  })

  it('creates, lists newest first and notifies subscribers', () => {
    vi.useFakeTimers()
    const user = signUpLocal(amina)
    const listener = vi.fn()
    const unsubscribe = subscribeLocalAppeals(listener)
    expect(listener).toHaveBeenLastCalledWith([])

    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
    const first = createLocalAppeal(appealData)
    vi.setSystemTime(new Date('2026-01-02T10:00:00Z'))
    const second = createLocalAppeal({ ...appealData, patientName: 'John' })
    vi.useRealTimers()

    expect(first).toMatchObject({ unitsPledged: 0, status: 'open', createdBy: user.uid, createdByName: 'Amina' })
    expect(listLocalAppeals().map((a) => a.id)).toEqual([second.id, first.id])
    expect(listener).toHaveBeenLastCalledWith(expect.arrayContaining([expect.objectContaining({ id: first.id })]))
    expect(getLocalAppeal(first.id).patientName).toBe('Mary')
    expect(getLocalAppeal('missing')).toBeNull()
    unsubscribe()
  })

  it('pledges units and fulfils the appeal when complete', () => {
    signUpLocal(amina)
    const appeal = createLocalAppeal(appealData)
    expect(pledgeLocalUnits(appeal.id, 2)).toMatchObject({ unitsPledged: 2, status: 'open' })
    expect(pledgeLocalUnits(appeal.id, 5)).toMatchObject({ unitsPledged: 3, status: 'fulfilled' })
    expect(() => pledgeLocalUnits('missing', 1)).toThrow('Appeal not found')
  })

  it('only lets the owner edit or delete', () => {
    signUpLocal(amina)
    const appeal = createLocalAppeal(appealData)
    expect(updateLocalAppeal(appeal.id, { status: 'fulfilled' }).status).toBe('fulfilled')

    signUpLocal({ name: 'Brian', email: 'brian@example.com', password: 'secret123' })
    expect(() => updateLocalAppeal(appeal.id, { status: 'open' })).toThrow('You can only edit your own appeals')
    expect(() => deleteLocalAppeal(appeal.id)).toThrow('You can only delete your own appeals')
    expect(() => updateLocalAppeal('missing', {})).toThrow('Appeal not found')
    expect(deleteLocalAppeal('missing')).toBeUndefined()

    signInLocal({ email: 'amina@example.com', password: 'secret123' })
    deleteLocalAppeal(appeal.id)
    expect(listLocalAppeals()).toEqual([])
  })
})
