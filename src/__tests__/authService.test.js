import { describe, expect, it, vi } from 'vitest'
import {
  isDemoMode,
  signIn,
  signInWithGoogle,
  signOutUser,
  signUp,
  subscribeToAuth,
} from '../services/authService.js'

// No Firebase keys in the test environment, so the service runs in demo (local storage) mode.
describe('authService in demo mode', () => {
  it('reports demo mode', () => {
    expect(isDemoMode).toBe(true)
  })

  it('signs up, signs out and signs in through the local backend', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToAuth(listener)

    const account = await signUp('Amina Wanjiku', 'amina@example.com', 'secret123')
    expect(account.name).toBe('Amina Wanjiku')
    expect(listener).toHaveBeenLastCalledWith(account)

    await signOutUser()
    expect(listener).toHaveBeenLastCalledWith(null)

    expect((await signIn('amina@example.com', 'secret123')).email).toBe('amina@example.com')
    unsubscribe()
  })

  it('explains that Google sign-in needs Firebase', async () => {
    await expect(signInWithGoogle()).rejects.toThrow(/Google sign-in needs Firebase/)
  })
})
