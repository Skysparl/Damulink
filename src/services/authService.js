import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase.js'
import {
  signInLocal,
  signOutLocal,
  signUpLocal,
  subscribeLocalAuth,
} from './localBackend.js'

export const isDemoMode = !isFirebaseConfigured

function toAccount(user) {
  if (!user) return null
  const fallbackName = (user.email || '').split('@')[0]
  return {
    uid: user.uid,
    email: user.email,
    name: user.displayName || fallbackName,
  }
}

function friendlyError(error) {
  const code = String(error?.code || '')

  if (code.includes('email-already-in-use')) return new Error('That email is already registered')
  if (code.includes('invalid-email')) return new Error('Enter a valid email address')
  if (code.includes('weak-password')) return new Error('Password must be at least 6 characters')
  if (
    code.includes('invalid-credential') ||
    code.includes('wrong-password') ||
    code.includes('user-not-found')
  ) {
    return new Error('Wrong email or password')
  }
  if (code.includes('network-request-failed')) return new Error('No internet connection')
  if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
    return new Error('Google sign-in was cancelled')
  }
  if (code.includes('popup-blocked')) return new Error('Allow pop-ups to sign in with Google')
  return new Error(error?.message || 'Something went wrong. Try again.')
}

export function subscribeToAuth(callback) {
  if (!isFirebaseConfigured) return subscribeLocalAuth(callback)
  return onAuthStateChanged(auth, (user) => callback(toAccount(user)))
}

export async function signIn(email, password) {
  if (!isFirebaseConfigured) return signInLocal({ email, password })

  try {
    const result = await signInWithEmailAndPassword(auth, String(email).trim(), password)
    return toAccount(result.user)
  } catch (error) {
    throw friendlyError(error)
  }
}

export async function signUp(name, email, password) {
  if (!isFirebaseConfigured) return signUpLocal({ name, email, password })

  try {
    const result = await createUserWithEmailAndPassword(auth, String(email).trim(), password)
    await updateProfile(result.user, { displayName: String(name).trim() })
    return toAccount(result.user)
  } catch (error) {
    throw friendlyError(error)
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error('Google sign-in needs Firebase. Add your keys to .env to enable it.')
  }

  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider())
    return toAccount(result.user)
  } catch (error) {
    throw friendlyError(error)
  }
}

export async function signOutUser() {
  if (!isFirebaseConfigured) {
    signOutLocal()
    return
  }
  await signOut(auth)
}
