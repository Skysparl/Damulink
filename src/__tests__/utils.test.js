import { describe, expect, it, vi } from 'vitest'
import {
  computePledge,
  isOwner,
  progressPercent,
  remainingUnits,
  summariseAppeals,
} from '../utils/appealLogic.js'
import { formatDate, formatRelativeTime, initials, pluralizeUnits, toDate } from '../utils/format.js'
import {
  hasErrors,
  isBlank,
  isValidEmail,
  validateAppeal,
  validateLogin,
  validateRegister,
} from '../utils/validation.js'
import { APPEAL_STATUS, BLOOD_TYPES, COUNTIES } from '../utils/constants.js'

describe('constants', () => {
  it('lists all 8 blood types and 47 counties', () => {
    expect(BLOOD_TYPES).toHaveLength(8)
    expect(COUNTIES).toHaveLength(47)
  })
})

describe('appealLogic', () => {
  it('works out remaining units and progress', () => {
    expect(remainingUnits({ units: 4, unitsPledged: 1 })).toBe(3)
    expect(remainingUnits({ units: 2, unitsPledged: 5 })).toBe(0)
    expect(remainingUnits(null)).toBe(0)
    expect(progressPercent({ units: 4, unitsPledged: 1 })).toBe(25)
    expect(progressPercent({ units: 2, unitsPledged: 9 })).toBe(100)
    expect(progressPercent({ units: 0 })).toBe(0)
    expect(progressPercent()).toBe(0)
  })

  it('applies a pledge and caps it at what is still needed', () => {
    expect(computePledge({ units: 4, unitsPledged: 1, status: 'open' }, 2)).toEqual({
      applied: 2,
      unitsPledged: 3,
      status: 'open',
      fulfilled: false,
    })
    expect(computePledge({ units: 4, unitsPledged: 3 }, 5)).toMatchObject({
      applied: 1,
      unitsPledged: 4,
      status: APPEAL_STATUS.FULFILLED,
      fulfilled: true,
    })
  })

  it('treats bad amounts as one unit and ignores fulfilled appeals', () => {
    expect(computePledge({ units: 3, unitsPledged: 0 }, 'abc').applied).toBe(1)
    expect(computePledge({ units: 3, unitsPledged: 0, status: 'fulfilled' }, 1)).toMatchObject({
      applied: 0,
      fulfilled: true,
    })
    expect(computePledge({ units: 2, unitsPledged: 2 }, 1).applied).toBe(0)
  })

  it('summarises appeals for the dashboard', () => {
    const totals = summariseAppeals([
      { status: 'open', unitsPledged: 2 },
      { status: 'fulfilled', unitsPledged: 3 },
      { status: 'open' },
    ])
    expect(totals).toEqual({ active: 2, fulfilled: 1, unitsPledged: 5 })
    expect(summariseAppeals()).toEqual({ active: 0, fulfilled: 0, unitsPledged: 0 })
  })

  it('checks ownership by user object or uid', () => {
    const appeal = { createdBy: 'u1' }
    expect(isOwner(appeal, { uid: 'u1' })).toBe(true)
    expect(isOwner(appeal, 'u1')).toBe(true)
    expect(isOwner(appeal, 'u2')).toBe(false)
    expect(isOwner(appeal, null)).toBe(false)
    expect(isOwner(null, 'u1')).toBe(false)
  })
})

describe('format', () => {
  it('converts values to dates', () => {
    const date = new Date('2026-01-10T10:00:00Z')
    expect(toDate(null)).toBeNull()
    expect(toDate(date)).toBe(date)
    expect(toDate({ toDate: () => date })).toBe(date)
    expect(toDate('not a date')).toBeNull()
    expect(toDate('2026-01-10T10:00:00Z').getTime()).toBe(date.getTime())
  })

  it('formats dates and relative times', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('2026-01-10T10:00:00Z')).toBe('10 Jan 2026')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'))
    expect(formatRelativeTime(null)).toBe('Just now')
    expect(formatRelativeTime('2026-01-10T11:59:50Z')).toBe('Just now')
    expect(formatRelativeTime('2026-01-10T11:30:00Z')).toBe('30 min ago')
    expect(formatRelativeTime('2026-01-10T11:00:00Z')).toBe('1 hour ago')
    expect(formatRelativeTime('2026-01-10T07:00:00Z')).toBe('5 hours ago')
    expect(formatRelativeTime('2026-01-09T12:00:00Z')).toBe('1 day ago')
    expect(formatRelativeTime('2026-01-07T12:00:00Z')).toBe('3 days ago')
    expect(formatRelativeTime('2025-12-01T12:00:00Z')).toBe('1 Dec 2025')
    vi.useRealTimers()
  })

  it('pluralises units and builds initials', () => {
    expect(pluralizeUnits(1)).toBe('1 unit')
    expect(pluralizeUnits(3)).toBe('3 units')
    expect(pluralizeUnits('x')).toBe('0 units')
    expect(initials('Amina Wanjiku Otieno')).toBe('AO')
    expect(initials('amina')).toBe('AM')
    expect(initials('')).toBe('DL')
  })
})

describe('validation', () => {
  it('detects blank values and emails', () => {
    expect(isBlank('  ')).toBe(true)
    expect(isBlank(undefined)).toBe(true)
    expect(isBlank('a')).toBe(false)
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('nope')).toBe(false)
    expect(hasErrors({})).toBe(false)
    expect(hasErrors({ a: 'x' })).toBe(true)
  })

  it('validates login', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    })
    expect(validateLogin({ email: 'bad', password: '123' })).toEqual({
      email: 'Enter a valid email address',
      password: 'Password must be at least 6 characters',
    })
    expect(validateLogin({ email: 'a@b.co', password: 'secret1' })).toEqual({})
  })

  it('validates registration', () => {
    expect(validateRegister({ name: '', email: '', password: '', confirmPassword: '' })).toEqual({
      name: 'Full name is required',
      email: 'Email is required',
      password: 'Password is required',
      confirmPassword: 'Confirm your password',
    })
    expect(
      validateRegister({ name: 'Al', email: 'x', password: '123', confirmPassword: '1' }),
    ).toEqual({
      name: 'Name is too short',
      email: 'Enter a valid email address',
      password: 'Password must be at least 6 characters',
      confirmPassword: 'Passwords do not match',
    })
    expect(
      validateRegister({ name: 'Amina', email: 'a@b.co', password: 'secret1', confirmPassword: 'secret1' }),
    ).toEqual({})
  })

  it('validates an appeal', () => {
    const good = {
      patientName: 'Mary',
      hospital: 'KNH',
      county: 'Nairobi',
      bloodType: 'O+',
      contactPhone: '0712 345 678',
      units: '3',
      urgency: 'critical',
    }
    expect(validateAppeal(good)).toEqual({})
    expect(Object.keys(validateAppeal({})).sort()).toEqual(
      ['bloodType', 'contactPhone', 'county', 'hospital', 'patientName', 'units', 'urgency'],
    )
    expect(validateAppeal({ ...good, contactPhone: '12345' }).contactPhone).toMatch(/Kenyan/)
    expect(validateAppeal({ ...good, units: '1.5' }).units).toBe('Units must be a whole number')
    expect(validateAppeal({ ...good, units: '50' }).units).toBe('Units must be between 1 and 20')
  })
})
