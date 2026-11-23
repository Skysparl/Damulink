import { beforeEach, describe, expect, it, vi } from 'vitest'

// Pretend Firebase is configured so the services take their Firestore / Firebase Auth paths.
const fakeAuth = vi.hoisted(() => ({ currentUser: null }))

vi.mock('../services/firebase.js', () => ({
  isFirebaseConfigured: true,
  auth: fakeAuth,
  db: { name: 'db' },
  app: {},
}))

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => 'appeals-col'),
  deleteDoc: vi.fn(),
  doc: vi.fn((_db, _col, id) => ({ id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn((col) => col),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  updateDoc: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() {}),
  createUserWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))

const firestore = await import('firebase/firestore')
const firebaseAuth = await import('firebase/auth')
const appeals = await import('../services/appealService.js')
const authService = await import('../services/authService.js')

function snap(id, data, exists = true) {
  return { id, exists: () => exists, data: () => data }
}

const stored = {
  patientName: 'Mary',
  units: 4,
  unitsPledged: 1,
  status: 'open',
  createdAt: { toDate: () => new Date('2026-01-01T10:00:00Z') },
  updatedAt: '2026-01-02T10:00:00.000Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  fakeAuth.currentUser = null
})

describe('appealService with Firestore', () => {
  it('reads appeals and converts timestamps', async () => {
    firestore.getDocs.mockResolvedValue({ docs: [snap('a1', stored)] })
    const [appeal] = await appeals.fetchAppeals()
    expect(appeal).toMatchObject({ id: 'a1', createdAt: '2026-01-01T10:00:00.000Z', updatedAt: '2026-01-02T10:00:00.000Z' })

    firestore.getDoc.mockResolvedValueOnce(snap('a1', { ...stored, createdAt: null, updatedAt: 1767261600000 }))
    expect((await appeals.fetchAppeal('a1')).updatedAt).toBe('2026-01-01T10:00:00.000Z')
    firestore.getDoc.mockResolvedValueOnce(snap('x', {}, false))
    expect(await appeals.fetchAppeal('x')).toBeNull()
  })

  it('subscribes to live updates with onSnapshot', () => {
    const unsubscribe = vi.fn()
    firestore.onSnapshot.mockImplementation((_q, next, fail) => {
      next({ docs: [snap('a1', stored)] })
      fail(new Error('denied'))
      return unsubscribe
    })
    const onData = vi.fn()
    const onError = vi.fn()
    expect(appeals.subscribeToAppeals(onData, onError)).toBe(unsubscribe)
    expect(onData).toHaveBeenCalledWith([expect.objectContaining({ id: 'a1' })])
    expect(onError).toHaveBeenCalledWith(expect.any(Error))
  })

  it('requires sign-in to create, then saves the owner', async () => {
    await expect(appeals.addAppeal({})).rejects.toThrow('You must be signed in')

    fakeAuth.currentUser = { uid: 'u1', displayName: '', email: 'amina@example.com' }
    firestore.addDoc.mockResolvedValue({ id: 'new' })
    firestore.getDoc.mockResolvedValue(snap('new', stored))
    const created = await appeals.addAppeal({ patientName: 'Mary' })
    expect(created.id).toBe('new')
    expect(firestore.addDoc.mock.calls[0][1]).toMatchObject({
      patientName: 'Mary',
      unitsPledged: 0,
      status: 'open',
      createdBy: 'u1',
      createdByName: 'amina',
    })
  })

  it('pledges inside a transaction', async () => {
    const transaction = { get: vi.fn(), update: vi.fn() }
    firestore.runTransaction.mockImplementation((_db, fn) => fn(transaction))

    transaction.get.mockResolvedValueOnce(snap('a1', stored))
    expect(await appeals.pledgeUnits('a1', 3)).toMatchObject({ unitsPledged: 4, status: 'fulfilled' })
    expect(transaction.update).toHaveBeenCalledWith({ id: 'a1' }, expect.objectContaining({ unitsPledged: 4 }))

    transaction.get.mockResolvedValueOnce(snap('a1', {}, false))
    await expect(appeals.pledgeUnits('a1', 1)).rejects.toThrow('Appeal not found')

    transaction.get.mockResolvedValueOnce(snap('a1', { ...stored, unitsPledged: 4 }))
    await expect(appeals.pledgeUnits('a1', 1)).rejects.toThrow('already has all the units')
  })

  it('edits and deletes', async () => {
    firestore.getDoc.mockResolvedValue(snap('a1', { ...stored, status: 'fulfilled' }))
    expect((await appeals.editAppeal('a1', { status: 'fulfilled' })).status).toBe('fulfilled')
    expect(firestore.updateDoc).toHaveBeenCalledWith({ id: 'a1' }, { status: 'fulfilled', updatedAt: 'server-ts' })
    await appeals.removeAppeal('a1')
    expect(firestore.deleteDoc).toHaveBeenCalledWith({ id: 'a1' })
  })
})

describe('authService with Firebase Auth', () => {
  const user = { uid: 'u1', email: 'amina@example.com', displayName: 'Amina W' }

  it('is not in demo mode', () => {
    expect(authService.isDemoMode).toBe(false)
  })

  it('maps the Firebase user on auth changes', () => {
    firebaseAuth.onAuthStateChanged.mockImplementation((_auth, cb) => {
      cb({ uid: 'u2', email: 'brian@example.com', displayName: null })
      cb(null)
    })
    const listener = vi.fn()
    authService.subscribeToAuth(listener)
    expect(listener).toHaveBeenNthCalledWith(1, { uid: 'u2', email: 'brian@example.com', name: 'brian' })
    expect(listener).toHaveBeenNthCalledWith(2, null)
  })

  it('signs in, signs up and signs out', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockResolvedValue({ user })
    expect(await authService.signIn(' amina@example.com ', 'pw')).toEqual({ uid: 'u1', email: user.email, name: 'Amina W' })
    expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(fakeAuth, 'amina@example.com', 'pw')

    firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ user })
    await authService.signUp(' Amina W ', 'amina@example.com', 'secret123')
    expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(user, { displayName: 'Amina W' })

    await authService.signOutUser()
    expect(firebaseAuth.signOut).toHaveBeenCalledWith(fakeAuth)
  })

  it('signs in with a Google popup', async () => {
    firebaseAuth.signInWithPopup.mockResolvedValue({ user })
    expect((await authService.signInWithGoogle()).name).toBe('Amina W')
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalledWith(fakeAuth, expect.any(firebaseAuth.GoogleAuthProvider))
  })

  it.each([
    ['auth/email-already-in-use', 'That email is already registered'],
    ['auth/invalid-email', 'Enter a valid email address'],
    ['auth/weak-password', 'Password must be at least 6 characters'],
    ['auth/invalid-credential', 'Wrong email or password'],
    ['auth/network-request-failed', 'No internet connection'],
    ['auth/popup-closed-by-user', 'Google sign-in was cancelled'],
    ['auth/popup-blocked', 'Allow pop-ups to sign in with Google'],
  ])('turns %s into a friendly message', async (code, message) => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValue({ code })
    await expect(authService.signIn('a@b.co', 'pw')).rejects.toThrow(message)
  })

  it('falls back to the raw message for unknown errors', async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(new Error('Boom'))
    await expect(authService.signUp('A', 'a@b.co', 'pw')).rejects.toThrow('Boom')
    firebaseAuth.signInWithPopup.mockRejectedValue({})
    await expect(authService.signInWithGoogle()).rejects.toThrow('Something went wrong')
  })
})
