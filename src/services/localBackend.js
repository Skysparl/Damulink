import { APPEAL_STATUS } from '../utils/constants.js'
import { computePledge } from '../utils/appealLogic.js'

const USER_KEY = 'damulink.users'
const APPEALS_KEY = 'damulink.appeals'
const SESSION_KEY = 'damulink.session'
const authListeners = new Set()

function read(key, fallback) {
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function makeId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

function notifyAuth(user) {
  authListeners.forEach((listener) => listener(user))
}

export function getLocalUser() {
  return read(SESSION_KEY, null)
}

export function subscribeLocalAuth(listener) {
  authListeners.add(listener)
  listener(getLocalUser())
  return () => authListeners.delete(listener)
}

export function signUpLocal({ name, email, password }) {
  const users = read(USER_KEY, [])
  const cleanEmail = String(email).trim().toLowerCase()

  if (users.some((user) => user.email === cleanEmail)) {
    throw new Error('That email is already registered')
  }

  const user = {
    uid: makeId('user'),
    name: String(name).trim(),
    email: cleanEmail,
    password,
  }
  users.push(user)
  write(USER_KEY, users)

  const account = { uid: user.uid, email: user.email, name: user.name }
  write(SESSION_KEY, account)
  notifyAuth(account)
  return account
}

export function signInLocal({ email, password }) {
  const users = read(USER_KEY, [])
  const cleanEmail = String(email).trim().toLowerCase()
  const user = users.find((item) => item.email === cleanEmail && item.password === password)

  if (!user) throw new Error('Wrong email or password')

  const account = { uid: user.uid, email: user.email, name: user.name }
  write(SESSION_KEY, account)
  notifyAuth(account)
  return account
}

export function signOutLocal() {
  window.localStorage.removeItem(SESSION_KEY)
  notifyAuth(null)
}

export function listLocalAppeals() {
  return read(APPEALS_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
}

export function getLocalAppeal(id) {
  return listLocalAppeals().find((appeal) => appeal.id === id) || null
}

export function createLocalAppeal(data) {
  const user = getLocalUser()
  if (!user) throw new Error('You must be signed in to post an appeal')

  const appeals = read(APPEALS_KEY, [])
  const now = new Date().toISOString()
  const appeal = {
    ...data,
    id: makeId('appeal'),
    unitsPledged: 0,
    status: APPEAL_STATUS.OPEN,
    createdBy: user.uid,
    createdByName: user.name,
    createdAt: now,
    updatedAt: now,
  }

  appeals.unshift(appeal)
  write(APPEALS_KEY, appeals)
  return appeal
}

export function pledgeLocalUnits(id, amount) {
  const appeals = read(APPEALS_KEY, [])
  const index = appeals.findIndex((appeal) => appeal.id === id)
  if (index === -1) throw new Error('Appeal not found')

  const pledge = computePledge(appeals[index], amount)
  if (!pledge) throw new Error('Enter at least one unit')

  appeals[index] = {
    ...appeals[index],
    unitsPledged: pledge.unitsPledged,
    status: pledge.status,
    updatedAt: new Date().toISOString(),
  }
  write(APPEALS_KEY, appeals)
  return appeals[index]
}

export function updateLocalAppeal(id, patch) {
  const appeals = read(APPEALS_KEY, [])
  const index = appeals.findIndex((appeal) => appeal.id === id)
  if (index === -1) throw new Error('Appeal not found')

  const user = getLocalUser()
  if (!user || appeals[index].createdBy !== user.uid) {
    throw new Error('You can only edit your own appeals')
  }

  appeals[index] = { ...appeals[index], ...patch, updatedAt: new Date().toISOString() }
  write(APPEALS_KEY, appeals)
  return appeals[index]
}

export function deleteLocalAppeal(id) {
  const appeals = read(APPEALS_KEY, [])
  const index = appeals.findIndex((appeal) => appeal.id === id)
  if (index === -1) return

  const user = getLocalUser()
  if (!user || appeals[index].createdBy !== user.uid) {
    throw new Error('You can only delete your own appeals')
  }

  appeals.splice(index, 1)
  write(APPEALS_KEY, appeals)
}
