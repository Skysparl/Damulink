import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase.js'
import { APPEAL_STATUS } from '../utils/constants.js'
import { computePledge, remainingUnits } from '../utils/appealLogic.js'
import {
  createLocalAppeal,
  deleteLocalAppeal,
  getLocalAppeal,
  listLocalAppeals,
  pledgeLocalUnits,
  updateLocalAppeal,
} from './localBackend.js'

function toIso(value) {
  if (!value) return new Date().toISOString()
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  return new Date(value).toISOString()
}

function toAppeal(snapshot) {
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  }
}

function currentUserName() {
  const user = auth?.currentUser
  if (!user) return 'DamuLink user'
  return user.displayName || (user.email || '').split('@')[0]
}

export async function fetchAppeals() {
  if (!isFirebaseConfigured) return listLocalAppeals()

  const snapshot = await getDocs(query(collection(db, 'appeals'), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(toAppeal)
}

export async function fetchAppeal(id) {
  if (!isFirebaseConfigured) return getLocalAppeal(id)

  const snapshot = await getDoc(doc(db, 'appeals', id))
  return snapshot.exists() ? toAppeal(snapshot) : null
}

export async function addAppeal(data) {
  if (!isFirebaseConfigured) return createLocalAppeal(data)
  if (!auth?.currentUser) throw new Error('You must be signed in to post an appeal')

  const ref = await addDoc(collection(db, 'appeals'), {
    ...data,
    unitsPledged: 0,
    status: APPEAL_STATUS.OPEN,
    createdBy: auth.currentUser.uid,
    createdByName: currentUserName(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return toAppeal(await getDoc(ref))
}

export async function pledgeUnits(id, amount) {
  if (!isFirebaseConfigured) return pledgeLocalUnits(id, amount)

  const ref = doc(db, 'appeals', id)
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Appeal not found')

    const current = toAppeal(snapshot)
    if (remainingUnits(current) === 0) {
      throw new Error('This appeal already has all the units it needs')
    }

    const pledge = computePledge(current, amount)
    if (!pledge) throw new Error('Enter at least one unit')

    transaction.update(ref, {
      unitsPledged: pledge.unitsPledged,
      status: pledge.status,
      updatedAt: serverTimestamp(),
    })

    return { ...current, unitsPledged: pledge.unitsPledged, status: pledge.status }
  })
}

export async function editAppeal(id, patch) {
  if (!isFirebaseConfigured) return updateLocalAppeal(id, patch)

  const ref = doc(db, 'appeals', id)
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() })
  return toAppeal(await getDoc(ref))
}

export async function removeAppeal(id) {
  if (!isFirebaseConfigured) return deleteLocalAppeal(id)
  await deleteDoc(doc(db, 'appeals', id))
}
